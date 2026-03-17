import { defineStore } from "pinia";
import { supabase } from "@/js/supabase.js";

export const useSupabaseStore = defineStore("supabaseData", {
  state: () => {
    return {
      currentUser: null,
      rflTeams: [],
      rflDrafts: [],
      currentDraftClass: [],
      currentPlayerAnalysis: [],
      currentAnalysis: [],
      showEditCard: false,
      filteredDraftClass: "",
      filteredTeam: "",
      filteredPick: "",
      alertMessage: null,
      alertType: null,
      currentFile: null,
    };
  },
  actions: {
    // Session
    // ========================================================================

    async getSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        this.currentUser = session?.user || null;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    // User
    // ========================================================================

    async registerUser(email, password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) throw error;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    async getCurrentUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        this.currentUser = user;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    async signOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        this.resetStore();
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    // RFL Teams
    // ========================================================================

    async fetchRflTeams() {
      try {
        const { data, error } = await supabase.from("RFL Teams").select();
        if (error) throw error;
        this.rflTeams = data;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    // RFL Drafts
    // ========================================================================

    async fetchRflDrafts() {
      try {
        const { data, error } = await supabase.from("RFL Drafts").select();
        if (error) throw error;
        this.rflDrafts = data;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    // Analysen
    // ========================================================================

    async fetchDraftClassAnalysis(draftClass, team) {
      try {
        const { data, error } = await supabase
          .from("Draftanalysen")
          .select()
          .eq("draft_class", draftClass)
          .eq("team_id", team);

        if (error) throw error;
        this.currentDraftClass = data;
      } catch (error) {
        console.log(error);

        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    async readAnalysis(draftClass, team, pick) {
      try {
        const { data, error } = await supabase
          .from("Draftanalysen")
          .select()
          .eq("draft_class", draftClass)
          .eq("team_id", team)
          .textSearch("pick", `'${pick}'`);

        if (error) throw error;
        this.currentPlayerAnalysis = data;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    async upsertAnalysis(importData) {
      try {
        const { data, error } = await supabase
          .from("Draftanalysen")
          .upsert(importData, { onConflict: "id" });

        if (error) throw error;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    // Files
    // ========================================================================

    async uploadFile(file) {
      if (!file) {
        this.alertType = "error";
        this.alertMessage = "Bitte waehle eine Datei aus.";
        return;
      }

      try {
        const fileExtension = file.value.name.split(".").pop();

        const pick =
          this.filteredPick == "trades"
            ? this.currentAnalysis.pick
            : this.filteredPick;

        const filename = `${this.filteredDraftClass}_${this.filteredTeam}_${pick}.${fileExtension}`;

        const { data, error } = await supabase.storage
          .from("Screenshots")
          .upload(filename, file.value, { upsert: true });

        if (error) throw error;

        this.upsertFileInfo({
          name: filename,
          draft_class: this.filteredDraftClass,
          team_id: this.filteredTeam,
          pick: pick,
        });
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    async upsertFileInfo(importData) {
      try {
        const { data, error } = await supabase
          .from("Bilder")
          .upsert(importData, { onConflict: "id" });

        if (error) throw error;

        this.fetchFile();
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    async fetchFile(pick) {
      if (!pick) pick = this.filteredPick;

      try {
        const { data, error } = await supabase
          .from("Bilder")
          .select("name")
          .eq("draft_class", this.filteredDraftClass)
          .eq("team_id", this.filteredTeam)
          .eq("pick", pick);

        if (error) throw error;

        const url = this.getImgUrl(data[0]?.name);

        if (this.filteredPick != "trades") {
          this.currentFile = url;
        } else {
          this.currentFile = null;
          return url;
        }
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    getImgUrl(name) {
      try {
        if (!name) return null;

        return supabase.storage.from("Screenshots").getPublicUrl(name)?.data
          ?.publicUrl;
      } catch (error) {
        this.alertType = "error";
        this.alertMessage = error.message;
      }
    },

    // Cleanup
    // ========================================================================

    resetStore() {
      this.currentUser = null;
      this.rflTeams = [];
      this.rflDrafts = [];
      this.currentPlayerAnalysis = [];
      this.currentAnalysis = [];
      this.showEditCard = false;
      this.filteredDraftClass = "";
      this.filteredTeam = "";
      this.filteredPick = "";
      this.alertMessage = null;
      this.alertType = null;
      this.currentFile = null;
    },
  },
});
