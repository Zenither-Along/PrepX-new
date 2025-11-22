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
    console.log("Child column created:", data);
    return data;
  }
