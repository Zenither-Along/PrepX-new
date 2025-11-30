-- Function to update total_sections in assignments when columns change
CREATE OR REPLACE FUNCTION update_assignment_section_counts()
RETURNS TRIGGER AS $$
DECLARE
  target_path_id UUID;
BEGIN
  -- Determine the path_id based on the operation
  IF (TG_OP = 'DELETE') THEN
    target_path_id := OLD.path_id;
  ELSE
    target_path_id := NEW.path_id;
  END IF;

  -- Only proceed if the column is/was a content column
  -- We check if the type is 'content' or if it changed to/from 'content'
  IF (TG_OP = 'DELETE' AND OLD.type = 'content') OR 
     (TG_OP = 'INSERT' AND NEW.type = 'content') OR
     (TG_OP = 'UPDATE' AND (OLD.type = 'content' OR NEW.type = 'content')) THEN
    
    -- Update all assignments linked to this path with the new count
    UPDATE assignments
    SET total_sections = (
      SELECT COUNT(*)
      FROM columns
      WHERE path_id = target_path_id
      AND type = 'content'
    )
    WHERE path_id = target_path_id;
    
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_assignment_counts ON columns;

CREATE TRIGGER trigger_update_assignment_counts
AFTER INSERT OR UPDATE OR DELETE ON columns
FOR EACH ROW
EXECUTE FUNCTION update_assignment_section_counts();
