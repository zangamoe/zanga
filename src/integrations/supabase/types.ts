export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          bio: string | null
          created_at: string
          custom_slug: string | null
          id: string
          instagram_url: string | null
          name: string
          profile_picture_url: string | null
          published: boolean
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          custom_slug?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          profile_picture_url?: string | null
          published?: boolean
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          custom_slug?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          profile_picture_url?: string | null
          published?: boolean
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      chapter_comments: {
        Row: {
          chapter_id: string
          comment: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          comment: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          comment?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_pages: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          image_url: string
          page_number: number
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          image_url: string
          page_number: number
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          image_url?: string
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapter_pages_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_ratings: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_ratings_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_reactions: {
        Row: {
          chapter_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_reactions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          id: string
          published_date: string
          reading_direction: string
          series_id: string
          title: string
          updated_at: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          id?: string
          published_date?: string
          reading_direction?: string
          series_id: string
          title: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          id?: string
          published_date?: string
          reading_direction?: string
          series_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      hero_slider_series: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          order_index: number
          series_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          series_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          series_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_slider_series_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          excerpt: string | null
          id: string
          image_url: string | null
          link_url: string | null
          order_index: number
          origin: string
          subtitle: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          excerpt?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          order_index?: number
          origin?: string
          subtitle?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          excerpt?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          order_index?: number
          origin?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          filter_criteria: Json | null
          id: string
          order_index: number | null
          section_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          filter_criteria?: Json | null
          id?: string
          order_index?: number | null
          section_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          filter_criteria?: Json | null
          id?: string
          order_index?: number | null
          section_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          label: string
          order_index: number
          path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          label: string
          order_index?: number
          path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          order_index?: number
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      merchandise: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          price: number | null
          purchase_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          purchase_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          purchase_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_builder: {
        Row: {
          access_level: string | null
          content_blocks: Json | null
          created_at: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: string
          created_at: string
          enabled: boolean
          id: string
          order_index: number
          section_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          section_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          section_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          cover_image_url: string
          created_at: string
          custom_slug: string | null
          detailed_synopsis: string | null
          id: string
          is_new: boolean
          next_chapter_release: string | null
          published: boolean
          ratings_enabled: boolean
          status: string
          synopsis: string
          tagline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url: string
          created_at?: string
          custom_slug?: string | null
          detailed_synopsis?: string | null
          id?: string
          is_new?: boolean
          next_chapter_release?: string | null
          published?: boolean
          ratings_enabled?: boolean
          status: string
          synopsis: string
          tagline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string
          created_at?: string
          custom_slug?: string | null
          detailed_synopsis?: string | null
          id?: string
          is_new?: boolean
          next_chapter_release?: string | null
          published?: boolean
          ratings_enabled?: boolean
          status?: string
          synopsis?: string
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      series_authors: {
        Row: {
          author_id: string
          series_id: string
        }
        Insert: {
          author_id: string
          series_id: string
        }
        Update: {
          author_id?: string
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_authors_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series_genres: {
        Row: {
          genre_id: string
          series_id: string
        }
        Insert: {
          genre_id: string
          series_id: string
        }
        Update: {
          genre_id?: string
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_genres_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          series_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          series_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          series_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_ratings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          last_updated: string
          type: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          last_updated?: string
          type: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          last_updated?: string
          type?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      chapter_ratings_summary: {
        Row: {
          average_rating: number | null
          chapter_id: string | null
          five_star: number | null
          four_star: number | null
          one_star: number | null
          three_star: number | null
          total_ratings: number | null
          two_star: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_ratings_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_reactions_summary: {
        Row: {
          chapter_id: string | null
          emoji: string | null
          reaction_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_reactions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_settings: {
        Row: {
          key: string | null
          type: string | null
          value: Json | null
        }
        Insert: {
          key?: string | null
          type?: string | null
          value?: Json | null
        }
        Update: {
          key?: string | null
          type?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      series_ratings_summary: {
        Row: {
          average_rating: number | null
          five_star: number | null
          four_star: number | null
          one_star: number | null
          series_id: string | null
          three_star: number | null
          total_ratings: number | null
          two_star: number | null
        }
        Relationships: [
          {
            foreignKeyName: "series_ratings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_comment_owner: {
        Args: { comment_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
