ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE OR REPLACE FUNCTION public.can_view_resource(_uid uuid, _resource uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.is_staff(_uid) OR EXISTS (SELECT 1 FROM public.resources r JOIN public.profiles p ON p.id = _uid WHERE r.id = _resource AND r.published AND p.is_active AND p.class_level = r.class_level AND public.has_role(_uid, 'student') AND (r.visibility = 'all' OR EXISTS (SELECT 1 FROM public.resource_access a WHERE a.resource_id = r.id AND a.student_id = _uid))); $$;
ALTER POLICY "submissions student insert" ON public.submissions WITH CHECK (student_id = auth.uid() AND public.has_role(auth.uid(),'student') AND status = 'submitted' AND marks IS NULL AND feedback IS NULL AND reviewed_at IS NULL AND reviewed_by IS NULL AND EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND a.published));
ALTER POLICY "doubts student insert" ON public.doubt_queries WITH CHECK (student_id = auth.uid() AND public.has_role(auth.uid(),'student') AND status = 'pending');
CREATE OR REPLACE FUNCTION public.validate_school_record() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ DECLARE maximum numeric; f jsonb; BEGIN
 IF TG_TABLE_NAME IN ('tests','assignments') THEN
  IF NEW.max_marks <= 0 OR NEW.max_marks::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Maximum marks must be positive'; END IF;
  IF TG_OP = 'UPDATE' AND NEW.max_marks < OLD.max_marks THEN
   IF TG_TABLE_NAME = 'tests' AND EXISTS (SELECT 1 FROM public.test_marks WHERE test_id = NEW.id AND marks > NEW.max_marks) THEN RAISE EXCEPTION 'Maximum is below existing marks'; END IF;
   IF TG_TABLE_NAME = 'assignments' AND EXISTS (SELECT 1 FROM public.submissions WHERE assignment_id = NEW.id AND marks > NEW.max_marks) THEN RAISE EXCEPTION 'Maximum is below existing marks'; END IF;
  END IF;
 ELSIF TG_TABLE_NAME = 'test_marks' THEN
  SELECT max_marks INTO maximum FROM public.tests WHERE id = NEW.test_id;
  IF maximum IS NULL OR NEW.marks < 0 OR NEW.marks > maximum OR NEW.marks::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Marks must be between zero and the test maximum'; END IF;
  IF NOT public.has_role(NEW.student_id,'student') THEN RAISE EXCEPTION 'Marks require a student account'; END IF;
 ELSIF TG_TABLE_NAME = 'submissions' THEN
  SELECT max_marks INTO maximum FROM public.assignments WHERE id = NEW.assignment_id;
  IF NEW.marks IS NOT NULL AND (NEW.marks < 0 OR NEW.marks > maximum OR NEW.marks::text IN ('NaN','Infinity','-Infinity')) THEN RAISE EXCEPTION 'Marks must be between zero and the assignment maximum'; END IF;
  IF NEW.file_path NOT LIKE NEW.student_id::text || '/%' THEN RAISE EXCEPTION 'Submission file must belong to its student'; END IF;
  IF jsonb_typeof(NEW.attachments) <> 'array' OR jsonb_array_length(NEW.attachments) > 9 THEN RAISE EXCEPTION 'Invalid attachment list'; END IF;
  FOR f IN SELECT value FROM jsonb_array_elements(NEW.attachments) LOOP
   IF f->>'path' IS NULL OR f->>'name' IS NULL OR f->>'path' NOT LIKE NEW.student_id::text || '/%' THEN RAISE EXCEPTION 'Attachment must belong to its student'; END IF;
  END LOOP;
 ELSIF TG_TABLE_NAME = 'doubt_queries' THEN
  IF NEW.attachment_path IS NOT NULL AND NEW.attachment_path NOT LIKE NEW.student_id::text || '/%' THEN RAISE EXCEPTION 'Doubt attachment must belong to its student'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER portal_validate_tests BEFORE INSERT OR UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION public.validate_school_record();
CREATE TRIGGER portal_validate_assignments BEFORE INSERT OR UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.validate_school_record();
CREATE TRIGGER portal_validate_marks BEFORE INSERT OR UPDATE ON public.test_marks FOR EACH ROW EXECUTE FUNCTION public.validate_school_record();
CREATE TRIGGER portal_validate_submissions BEFORE INSERT OR UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.validate_school_record();
CREATE TRIGGER portal_validate_doubts BEFORE INSERT OR UPDATE ON public.doubt_queries FOR EACH ROW EXECUTE FUNCTION public.validate_school_record();
CREATE OR REPLACE FUNCTION public.resubmit_work(_submission uuid, _file_path text, _file_name text, _note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 IF NOT public.has_role(auth.uid(),'student') OR _file_path NOT LIKE auth.uid()::text || '/%' THEN RAISE EXCEPTION 'Resubmission not allowed'; END IF;
 UPDATE public.submissions SET file_path=_file_path,file_name=_file_name,note=_note,attachments='[]'::jsonb,marks=NULL,feedback=NULL,reviewed_at=NULL,reviewed_by=NULL,submitted_at=now(),status='submitted' WHERE id=_submission AND student_id=auth.uid() AND status='corrections_required';
 IF NOT FOUND THEN RAISE EXCEPTION 'Resubmission not allowed'; END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.resubmit_work(uuid,text,text,text) TO authenticated;
CREATE POLICY "doubts private read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='doubts' AND (public.is_staff(auth.uid()) OR (storage.foldername(name))[1]=auth.uid()::text));
CREATE POLICY "doubts own upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='doubts' AND public.has_role(auth.uid(),'student') AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png','txt','docx'));
ALTER POLICY "submissions own upload" ON storage.objects WITH CHECK (bucket_id='submissions' AND public.has_role(auth.uid(),'student') AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png'));
ALTER POLICY "resources staff upload" ON storage.objects WITH CHECK (bucket_id='resources' AND public.is_staff(auth.uid()) AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png','txt','docx'));
ALTER POLICY "assignment papers staff upload" ON storage.objects WITH CHECK (bucket_id='assignment-papers' AND public.is_staff(auth.uid()) AND lower(storage.extension(name))='pdf');