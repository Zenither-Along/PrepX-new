"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPath(title: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("learning_paths")
    .insert([
      {
        user_id: userId,
        title: title || "Untitled Path",
        subtitle: "Add a description",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating path:", error);
    throw new Error(error.message);
  }

  if (data) {
    // Create the initial root column
    const { error: columnError } = await supabase
      .from("columns")
      .insert([
        {
          path_id: data.id,
          title: "Main Column",
          order_index: 0,
          type: "branch",
          parent_item_id: null
        },
      ]);
      
    if (columnError) {
        console.error("Error creating initial column:", columnError);
    }
    
    redirect(`/path/${data.id}/edit`);
  }
}

export async function addColumnItem(columnId: string, title: string, orderIndex: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("column_items")
    .insert([{ column_id: columnId, title, order_index: orderIndex }])
    .select()
    .single();

  if (error) {
    console.error("Error adding item:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteColumn(columnId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // The database should cascade delete items and content sections
  // But we'll be explicit to ensure proper cleanup
  const { error } = await supabase
    .from("columns")
    .delete()
    .eq("id", columnId);

  if (error) {
    console.error("Error deleting column:", error);
    throw new Error(error.message);
  }
}


export async function addContentSection(columnId: string, type: string, orderIndex: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const content = type === 'heading' ? { text: '' } : type === 'paragraph' ? { text: '' } : { url: '' };

  const { data, error } = await supabase
    .from("content_sections")
    .insert([{ column_id: columnId, type, content, order_index: orderIndex }])
    .select()
    .single();

  if (error) {
    console.error("Error adding section:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateContentSection(sectionId: string, content: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("content_sections")
    .update({ content })
    .eq("id", sectionId);

  if (error) {
    console.error("Error updating section:", error);
    throw new Error(error.message);
  }
}

export async function deleteContentSection(sectionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("content_sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    console.error("Error deleting section:", error);
    throw new Error(error.message);
  }
}

export async function savePath(pathId: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("learning_paths")
    .update({ title })
    .eq("id", pathId);

  if (error) {
    console.error("Error saving path:", error);
    throw new Error(error.message);
  }
}

export async function updatePathSubtitle(pathId: string, subtitle: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("learning_paths")
    .update({ subtitle })
    .eq("id", pathId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating subtitle:", error);
    throw new Error(error.message);
  }
}

export async function saveColumn(columnId: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("columns")
    .update({ title })
    .eq("id", columnId);

  if (error) {
    console.error("Error saving column:", error);
    throw new Error(error.message);
  }
}

export async function saveItems(items: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  for (const item of items) {
    const { error } = await supabase
      .from("column_items")
      .update({ 
        title: item.title, 
        order_index: item.order_index,
        // parent_item_id and column_type are removed from items, handled by columns structure now
      })
      .eq("id", item.id);

    if (error) {
      console.error("Error updating item:", error);
      throw new Error(error.message);
    }
  }
}

export async function saveSections(sections: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("content_sections")
    .upsert(sections);

  if (error) {
    console.error("Error saving sections:", error);
    throw new Error(error.message);
  }
}

export async function deleteColumnItem(itemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // First delete any columns that are children of this item (cascade)
  await supabase
    .from("columns")
    .delete()
    .eq("parent_item_id", itemId);

  // Then delete the item itself
  const { error } = await supabase
    .from("column_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error deleting item:", error);
    throw new Error(error.message);
  }
}

export async function insertColumnItems(columnId: string, items: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const itemsToInsert = items.map(item => ({
    column_id: columnId,
    title: item.title,
    order_index: item.order_index,
  }));

  const { data, error } = await supabase.from("column_items").insert(itemsToInsert).select();
  if (error) {
    console.error("Error inserting items:", error);
    throw new Error(error.message);
  }
  // Return inserted rows with generated IDs
  return data;
}

export async function insertContentSections(sections: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // Remove temp IDs - let database auto-generate UUIDs
  const sectionsToInsert = sections.map(({ id, ...section }) => section);

  const { error } = await supabase
    .from("content_sections")
    .insert(sectionsToInsert);

  if (error) {
    console.error("Error inserting sections:", error);
    throw new Error(error.message);
  }
}

export async function deletePath(pathId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // First delete all columns related to this path (cascade should handle items and sections)
  await supabase
    .from("columns")
    .delete()
    .eq("path_id", pathId);

  // Delete the path itself
  const { error } = await supabase
    .from("learning_paths")
    .delete()
    .eq("id", pathId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting path:", error);
    throw new Error(error.message);
  }
}

// New helper to create a child column
export async function createChildColumn(pathId: string, parentItemId: string | null, type: 'branch' | 'content') {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const supabase = createSupabaseClient();
    
    console.log(`Creating child column: pathId=${pathId}, parentItemId=${parentItemId}, type=${type}`);
  
    const { data, error } = await supabase
      .from("columns")
      .insert([{
          path_id: pathId,
          parent_item_id: parentItemId,
          type,
          title: type === 'branch' ? 'New Branch' : 'Content',
          order_index: 0 
      }])
      .select()
      .single();
  
    if (error) {
      console.error("Error creating child column:", error);
      throw new Error(error.message);
    }
// ... existing code ...
    console.log("Child column created:", data);
    return data;
  }

export async function setMajorPath(pathId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // 1. Unset major for all paths of this user
  const { error: unsetError } = await supabase
    .from("learning_paths")
    .update({ is_major: false })
    .eq("user_id", userId);

  if (unsetError) {
    console.error("Error unsetting major paths:", unsetError);
    throw new Error(unsetError.message);
  }

  // 2. Set the new major path
  const { error: setError } = await supabase
    .from("learning_paths")
    .update({ is_major: true })
    .eq("id", pathId)
    .eq("user_id", userId);

  if (setError) {
    console.error("Error setting major path:", setError);
    throw new Error(setError.message);
  }
  
  revalidatePath("/");
}

export async function unsetMajorPath(pathId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("learning_paths")
    .update({ is_major: false })
    .eq("id", pathId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error unsetting major path:", error);
    throw new Error(error.message);
  }
  
  revalidatePath("/");
}

export async function publishPath(pathId: string, isPublic: boolean, tags: string[] = []) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();
  
  // Check if it's a clone
  const { data: path } = await supabase
    .from("learning_paths")
    .select("original_path_id")
    .eq("id", pathId)
    .single();

  if (path?.original_path_id) {
    throw new Error("Cannot publish cloned paths");
  }

  const { error } = await supabase
    .from("learning_paths")
    .update({ 
      is_public: isPublic,
      tags: tags,
    })
    .eq("id", pathId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error publishing path:", error);
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/explore");
}



export async function clonePath(originalPathId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // 1. Fetch original path
  const { data: originalPath, error: pathError } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", originalPathId)
    .single();

  if (pathError || !originalPath) throw new Error("Path not found");

  // 2. Create new path
  const { data: newPath, error: createError } = await supabase
    .from("learning_paths")
    .insert([{
      user_id: userId,
      title: `${originalPath.title} (Clone)`,
      subtitle: originalPath.subtitle,
      is_public: false, // Clones start as private
      tags: originalPath.tags,
      clones: 0,
      likes: 0,
      original_path_id: originalPathId // Track the source
    }])
    .select()
    .single();

  if (createError) throw new Error(createError.message);

  // 3. Recursive cloning function
  async function cloneColumnRecursively(originalColId: string, newPathId: string, newParentItemId: string | null) {
    // Fetch original column
    const { data: originalCol } = await supabase
      .from("columns")
      .select("*")
      .eq("id", originalColId)
      .single();
      
    if (!originalCol) return;

    // Create new column
    const { data: newCol, error: colError } = await supabase
      .from("columns")
      .insert([{
        path_id: newPathId,
        parent_item_id: newParentItemId,
        type: originalCol.type,
        title: originalCol.title,
        order_index: originalCol.order_index
      }])
      .select()
      .single();

    if (colError) throw colError;

    // If it's a branch, clone items
    if (originalCol.type === 'branch') {
      const { data: items } = await supabase
        .from("column_items")
        .select("*")
        .eq("column_id", originalColId);

      if (items) {
        for (const item of items) {
          // Create new item
          const { data: newItem, error: itemError } = await supabase
            .from("column_items")
            .insert([{
              column_id: newCol.id,
              title: item.title,
              order_index: item.order_index
            }])
            .select()
            .single();
            
          if (itemError) throw itemError;

          // Check for child columns of this item
          const { data: childCols } = await supabase
            .from("columns")
            .select("id")
            .eq("parent_item_id", item.id);
            
          if (childCols) {
            for (const childCol of childCols) {
              await cloneColumnRecursively(childCol.id, newPathId, newItem.id);
            }
          }
        }
      }
    } 
    // If it's content, clone sections
    else if (originalCol.type === 'content') {
      const { data: sections } = await supabase
        .from("content_sections")
        .select("*")
        .eq("column_id", originalColId);

      if (sections) {
        const newSections = sections.map(s => ({
          column_id: newCol.id,
          type: s.type,
          content: s.content,
          order_index: s.order_index
        }));
        
        if (newSections.length > 0) {
          await supabase.from("content_sections").insert(newSections);
        }
      }
    }
  }

  // 4. Start cloning from root columns
  const { data: rootCols } = await supabase
    .from("columns")
    .select("id")
    .eq("path_id", originalPathId)
    .is("parent_item_id", null);

  if (rootCols) {
    for (const col of rootCols) {
      await cloneColumnRecursively(col.id, newPath.id, null);
    }
  }

  // 5. Increment clone count on original
  await supabase
    .from("learning_paths")
    .update({ clones: (originalPath.clones || 0) + 1 })
    .eq("id", originalPathId);

  revalidatePath("/");
  return newPath.id;
}
