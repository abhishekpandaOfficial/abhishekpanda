import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photo: string | null;
  dateOfBirth: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  generation: number;
  parentId: string | null;
  spouseId: string | null;
}

interface DbFamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  photo_url: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  generation: number;
  parent_id: string | null;
  spouse_id: string | null;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
  updated_at: string;
}

const initialFamilyMembers: FamilyMember[] = [
  { id: "gf", name: "Late Shri Gopal Panda", relationship: "Grandfather (Paternal)", photo: null, dateOfBirth: "1935-01-15", occupation: "Freedom Fighter / Teacher", phone: "", email: "", address: "Odisha, India", notes: "Respected patriarch of the family", generation: 1, parentId: null, spouseId: "gm" },
  { id: "gm", name: "Late Smt. Sabitri Panda", relationship: "Grandmother (Paternal)", photo: null, dateOfBirth: "1940-03-20", occupation: "Homemaker", phone: "", email: "", address: "Odisha, India", notes: "Loving grandmother", generation: 1, parentId: null, spouseId: "gf" },
  { id: "f", name: "Shri Sarat Chandra Panda", relationship: "Father", photo: null, dateOfBirth: "1965-06-10", occupation: "Government Officer (Retd.)", phone: "+91-9876543210", email: "sarat.panda@email.com", address: "Bhubaneswar, Odisha", notes: "My guiding light and inspiration", generation: 2, parentId: "gf", spouseId: "m" },
  { id: "m", name: "Smt. Sanjukta Panda", relationship: "Mother", photo: null, dateOfBirth: "1970-09-25", occupation: "School Teacher (Retd.)", phone: "+91-9876543211", email: "sanjukta.panda@email.com", address: "Bhubaneswar, Odisha", notes: "The pillar of our family", generation: 2, parentId: null, spouseId: "f" },
  { id: "me", name: "Abhishek Panda", relationship: "Self", photo: null, dateOfBirth: "1992-08-15", occupation: "CEO & Founder, CropXon Innovations", phone: "+91-8917549065", email: "abhishek@cropxon.com", address: "Bangalore, India", notes: "Engineering ideas into reality", generation: 3, parentId: "f", spouseId: "wife" },
  { id: "wife", name: "Smt. Priyanka Panda", relationship: "Wife", photo: null, dateOfBirth: "1994-12-01", occupation: "Software Engineer", phone: "+91-9876543213", email: "priyanka@email.com", address: "Bangalore, India", notes: "My partner in everything", generation: 3, parentId: null, spouseId: "me" },
  { id: "d", name: "Aadhya Panda", relationship: "Daughter", photo: null, dateOfBirth: "2022-05-10", occupation: "Student", phone: "", email: "", address: "Bangalore, India", notes: "Our little princess", generation: 4, parentId: "me", spouseId: null },
  { id: "s", name: "Arjun Panda", relationship: "Son", photo: null, dateOfBirth: "2024-02-14", occupation: "Toddler", phone: "", email: "", address: "Bangalore, India", notes: "Our little champ", generation: 4, parentId: "me", spouseId: null },
];

const mapDbToFamilyMember = (db: DbFamilyMember): FamilyMember => ({
  id: db.id,
  name: db.name,
  relationship: db.relationship,
  photo: db.photo_url,
  dateOfBirth: db.date_of_birth || "",
  occupation: db.occupation || "",
  phone: db.phone || "",
  email: db.email || "",
  address: db.address || "",
  notes: db.notes || "",
  generation: db.generation,
  parentId: db.parent_id,
  spouseId: db.spouse_id,
});

export const useFamilyMembers = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch family members from database
  const fetchFamilyMembers = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", userId)
        .order("generation", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setFamilyMembers(data.map(mapDbToFamilyMember));
      } else {
        // Initialize with default data if no records exist
        setFamilyMembers(initialFamilyMembers);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
      // Fall back to initial data
      setFamilyMembers(initialFamilyMembers);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  // Save a family member
  const saveFamilyMember = useCallback(async (member: FamilyMember) => {
    if (!userId) {
      toast.error("Please sign in to save changes");
      return false;
    }

    try {
      const dbData = {
        user_id: userId,
        name: member.name,
        relationship: member.relationship,
        photo_url: member.photo,
        date_of_birth: member.dateOfBirth || null,
        occupation: member.occupation || null,
        phone: member.phone || null,
        email: member.email || null,
        address: member.address || null,
        notes: member.notes || null,
        generation: member.generation,
        parent_id: member.parentId,
        spouse_id: member.spouseId,
      };

      // Check if member exists in DB (has UUID format)
      const isExistingDbRecord = member.id.includes("-") && member.id.length === 36;

      if (isExistingDbRecord) {
        // Update existing record
        const { error } = await supabase
          .from("family_members")
          .update(dbData)
          .eq("id", member.id)
          .eq("user_id", userId);

        if (error) throw error;

        setFamilyMembers(prev => 
          prev.map(m => m.id === member.id ? member : m)
        );
      } else {
        // Insert new record (convert from initial data)
        const { data, error } = await supabase
          .from("family_members")
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newMember = mapDbToFamilyMember(data);
          setFamilyMembers(prev => 
            prev.map(m => m.id === member.id ? newMember : m)
          );
        }
      }

      toast.success("Profile saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving family member:", error);
      toast.error("Failed to save profile");
      return false;
    }
  }, [userId]);

  // Delete a family member
  const deleteFamilyMember = useCallback(async (memberId: string) => {
    if (!userId) {
      toast.error("Please sign in to delete");
      return false;
    }

    try {
      const isExistingDbRecord = memberId.includes("-") && memberId.length === 36;

      if (isExistingDbRecord) {
        const { error } = await supabase
          .from("family_members")
          .delete()
          .eq("id", memberId)
          .eq("user_id", userId);

        if (error) throw error;
      }

      setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success("Family member removed");
      return true;
    } catch (error) {
      console.error("Error deleting family member:", error);
      toast.error("Failed to delete");
      return false;
    }
  }, [userId]);

  // Initialize database with default data
  const initializeDatabase = useCallback(async () => {
    if (!userId) {
      toast.error("Please sign in first");
      return false;
    }

    try {
      // Check if data already exists
      const { data: existing } = await supabase
        .from("family_members")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (existing && existing.length > 0) {
        toast.info("Family data already saved");
        return true;
      }

      // Insert all initial members
      const dbData = initialFamilyMembers.map(member => ({
        user_id: userId,
        name: member.name,
        relationship: member.relationship,
        photo_url: member.photo,
        date_of_birth: member.dateOfBirth || null,
        occupation: member.occupation || null,
        phone: member.phone || null,
        email: member.email || null,
        address: member.address || null,
        notes: member.notes || null,
        generation: member.generation,
        parent_id: member.parentId,
        spouse_id: member.spouseId,
      }));

      const { data, error } = await supabase
        .from("family_members")
        .insert(dbData)
        .select();

      if (error) throw error;

      if (data) {
        setFamilyMembers(data.map(mapDbToFamilyMember));
        toast.success("Family data saved to cloud");
      }

      return true;
    } catch (error) {
      console.error("Error initializing database:", error);
      toast.error("Failed to save to cloud");
      return false;
    }
  }, [userId]);

  return {
    familyMembers,
    setFamilyMembers,
    loading,
    saveFamilyMember,
    deleteFamilyMember,
    initializeDatabase,
    refreshData: fetchFamilyMembers,
    isAuthenticated: !!userId,
  };
};

export default useFamilyMembers;
