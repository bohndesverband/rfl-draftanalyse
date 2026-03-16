import { defineStore } from "pinia";
import { supabase } from "@/js/supabase.js";

export const useSupabaseStore = defineStore("supabaseData", {
	state: () => {
		return {
			currentUser: null,
			rflTeams: [],
			rflDrafts: [],
			currentPlayerAnalysis: [],
			currentAnalysis: [],
			showEditCard: false,
			filteredDraftClass: "",
			filteredTeam: "",
			filteredPick: "",
			alertMessage: null,
			alertType: null,
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
				this.currentUser = null;
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

		async readAnalysis(draftClass, team, pick) {
			try {
				const { data, error } = await supabase
					.from("Draftanalysen")
					.select()
					.eq("draft_class", draftClass)
					.eq("team_id", team)
					.eq("pick", pick);

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
	},
});
