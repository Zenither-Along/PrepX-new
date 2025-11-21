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
    // Create the initial root branch
    const { error: branchError } = await supabase
      .from("branches")
      .insert([
        {
          path_id: data.id,
          title: "Main Branch",
          order_index: 0,
        },
      ]);
      
    if (branchError) {
        console.error("Error creating initial branch:", branchError);
    }
    
    redirect(`/path/${data.id}/edit`);
  }
}

export async function addBranchItem(branchId: string, title: string, orderIndex: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("branch_items")
    .insert([{ branch_id: branchId, title, order_index: orderIndex }])
    .select()
    .single();

  if (error) {
    console.error("Error adding item:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function addContentSection(itemId: string, type: string, orderIndex: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const content = type === 'heading' ? { text: '' } : type === 'paragraph' ? { text: '' } : { url: '' };

  const { data, error } = await supabase
    .from("content_sections")
    .insert([{ item_id: itemId, type, content, order_index: orderIndex }])
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

export async function saveBranch(branchId: string, title: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("branches")
    .update({ title })
    .eq("id", branchId);

  if (error) {
    console.error("Error saving branch:", error);
    throw new Error(error.message);
  }
}

export async function saveItems(items: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("branch_items")
    .upsert(items);

  if (error) {
    console.error("Error saving items:", error);
    throw new Error(error.message);
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

export async function deleteBranchItem(itemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // First delete all content sections for this item
  await supabase
    .from("content_sections")
    .delete()
    .eq("item_id", itemId);

  // Then delete the item itself
  const { error } = await supabase
    .from("branch_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error deleting item:", error);
    throw new Error(error.message);
  }
}

export async function insertBranchItems(items: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("branch_items")
    .insert(items)
    .select();

  if (error) {
    console.error("Error inserting items:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function insertContentSections(sections: any[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("content_sections")
    .insert(sections)
    .select();

  if (error) {
    console.error("Error inserting sections:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deletePath(pathId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  // First delete all related data (cascade delete)
  const { data: branches } = await supabase
    .from("branches")
    .select("id")
    .eq("path_id", pathId);

  if (branches) {
    for (const branch of branches) {
      const { data: items } = await supabase
        .from("branch_items")
        .select("id")
        .eq("branch_id", branch.id);

      if (items) {
        for (const item of items) {
          await supabase
            .from("content_sections")
            .delete()
            .eq("item_id", item.id);
        }
      }

      await supabase
        .from("branch_items")
        .delete()
        .eq("branch_id", branch.id);
    }

    await supabase
      .from("branches")
      .delete()
      .eq("path_id", pathId);
  }

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
