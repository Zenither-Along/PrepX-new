-- Add generation status columns to learning_paths table
ALTER TABLE learning_paths 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ready' CHECK (status IN ('generating', 'ready', 'error')),
ADD COLUMN IF NOT EXISTS generation_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS generation_step text;

-- Update existing rows to have 'ready' status (though default handles new ones)
UPDATE learning_paths SET status = 'ready' WHERE status IS NULL;
