import type { SupabaseClient } from "@supabase/supabase-js";

export interface GeneratedPathData {
  path: {
    title: string;
    subtitle: string;
  };
  branches: Array<{
    title: string;
    items: Array<{
      title: string;
      sections?: Array<{
        type: string;
        content: string | string[];
      }>;
    }>;
  }>;
}

export async function saveGeneratedPath(
  supabase: SupabaseClient,
  userId: string,
  generatedData: GeneratedPathData
): Promise<string> {
  // 1. Create the path
  const { data: pathData, error: pathError } = await supabase
    .from("learning_paths")
    .insert({
      user_id: userId,
      title: generatedData.path.title,
      subtitle: generatedData.path.subtitle,
    })
    .select()
    .single();

  if (pathError || !pathData) {
    console.error("Error creating path:", pathError);
    throw new Error("Failed to create path");
  }

  const pathId = pathData.id;

  // 2. Create branch columns
  for (let columnIdx = 0; columnIdx < generatedData.branches.length; columnIdx++) {
    const branch = generatedData.branches[columnIdx];
    
    const { data: columnData, error: columnError } = await supabase
      .from("columns")
      .insert({
        path_id: pathId,
        title: branch.title,
        type: 'branch',
        order_index: columnIdx,
      })
      .select()
      .single();

    if (columnError || !columnData) {
      console.error("Error creating column:", columnError);
      continue;
    }

    // 3. Create items for this branch column
    for (let itemIdx = 0; itemIdx < branch.items.length; itemIdx++) {
      const item = branch.items[itemIdx];
      
      const { data: itemData, error: itemError } = await supabase
        .from("column_items")
        .insert({
          column_id: columnData.id,
          title: item.title,
          order_index: itemIdx,
        })
        .select()
        .single();

      if (itemError || !itemData) {
        console.error("Error creating item:", itemError);
        continue;
      }

      // 4. If item has sections, create a content column for it
      if (item.sections && item.sections.length > 0) {
        const { data: contentColumnData, error: contentColumnError } = await supabase
          .from("columns")
          .insert({
            path_id: pathId,
            parent_item_id: itemData.id,
            title: item.title,
            type: 'content',
            order_index: 0,
          })
          .select()
          .single();

        if (contentColumnError || !contentColumnData) {
          console.error("Error creating content column:", contentColumnError);
          continue;
        }

        // 5. Create content sections in the content column
        for (let sectionIdx = 0; sectionIdx < item.sections.length; sectionIdx++) {
          const section = item.sections[sectionIdx];
          
          // Format content based on type
          let contentData: any = {};
          
          if (section.type === "heading") {
            contentData = { text: section.content };
          } else if (section.type === "paragraph") {
            contentData = { text: section.content };
          } else if (section.type === "code") {
            contentData = { 
              code: section.content,
              language: "javascript"
            };
          } else if (section.type === "list") {
            contentData = { 
              items: Array.isArray(section.content) ? section.content : [section.content]
            };
          } else {
            contentData = { text: section.content };
          }

          const { error: sectionError } = await supabase
            .from("content_sections")
            .insert({
              column_id: contentColumnData.id,
              type: section.type,
              content: contentData,
              order_index: sectionIdx,
            });

          if (sectionError) {
            console.error("Error creating section:", sectionError);
          }
        }
      }
    }
  }

  return pathId;
}
