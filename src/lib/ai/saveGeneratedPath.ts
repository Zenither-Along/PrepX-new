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

  // 2. Create root branch column (for modules)
  const { data: rootColumnData, error: rootColumnError } = await supabase
    .from("columns")
    .insert({
      path_id: pathId,
      title: "Syllabus",
      type: 'branch',
      order_index: 0,
      parent_item_id: null,
    })
    .select()
    .single();

  if (rootColumnError || !rootColumnData) {
    console.error("Error creating root column:", rootColumnError);
    throw new Error("Failed to create root column");
  }

  // 3. Create items (modules) in root branch
  for (let moduleIdx = 0; moduleIdx < generatedData.branches.length; moduleIdx++) {
    const module = generatedData.branches[moduleIdx];
    
    const { data: moduleItemData, error: moduleItemError } = await supabase
      .from("column_items")
      .insert({
        column_id: rootColumnData.id,
        title: module.title,
        order_index: moduleIdx,
      })
      .select()
      .single();

    if (moduleItemError || !moduleItemData) {
      console.error("Error creating module item:", moduleItemError);
      continue;
    }

    // 4. Create sub-branch column for topics in this module
    const { data: topicsBranchData, error: topicsBranchError } = await supabase
      .from("columns")
      .insert({
        path_id: pathId,
        parent_item_id: moduleItemData.id,
        title: module.title,
        type: 'branch',
        order_index: 0,
      })
      .select()
      .single();

    if (topicsBranchError || !topicsBranchData) {
      console.error("Error creating topics branch:", topicsBranchError);
      continue;
    }

    // 5. Create items (topics) in the topics branch
    for (let topicIdx = 0; topicIdx < module.items.length; topicIdx++) {
      const topic = module.items[topicIdx];
      
      const { data: topicItemData, error: topicItemError } = await supabase
        .from("column_items")
        .insert({
          column_id: topicsBranchData.id,
          title: topic.title,
          order_index: topicIdx,
        })
        .select()
        .single();

      if (topicItemError || !topicItemData) {
        console.error("Error creating topic item:", topicItemError);
        continue;
      }

      // 6. If topic has sections, create a content column for it
      if (topic.sections && topic.sections.length > 0) {
        const { data: contentColumnData, error: contentColumnError } = await supabase
          .from("columns")
          .insert({
            path_id: pathId,
            parent_item_id: topicItemData.id,
            title: topic.title,
            type: 'content',
            order_index: 0,
          })
          .select()
          .single();

        if (contentColumnError || !contentColumnData) {
          console.error("Error creating content column:", contentColumnError);
          continue;
        }

        // 7. Create content sections in the content column
        for (let sectionIdx = 0; sectionIdx < topic.sections.length; sectionIdx++) {
          const section = topic.sections[sectionIdx];
          
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
