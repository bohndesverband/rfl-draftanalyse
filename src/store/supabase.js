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

		// Files
		// ========================================================================

		async uploadFile(file) {
			if (!file) {
				this.alertType = "error";
				this.alertMessage = "Bitte waehle eine Datei aus.";
				return;
			}

			try {
				const { data, error } = await supabase.storage
					.from("Screenshots")
					.upload(file.value.name, file.value, { upsert: true });

				if (error) throw error;

				this.upsertFileInfo({
					name: file.value.name,
					draft_class: this.filteredDraftClass,
					team_id: this.filteredTeam,
					pick: this.filteredPick,
				});
				s;
			} catch (error) {
				console.log(error);

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

		async fetchFile() {
			try {
				const { data, error } = await supabase
					.from("Bilder")
					.select("name")
					.eq("draft_class", this.filteredDraftClass)
					.eq("team_id", this.filteredTeam)
					.eq("pick", this.filteredPick);

				if (error) throw error;

				try {
					this.currentFile = supabase.storage
						.from("Screenshots")
						.getPublicUrl(data[0]?.name).data.publicUrl;
				} catch (error) {
					this.currentFile = null;
				}
			} catch (error) {
				this.alertType = "error";
				this.alertMessage = error.message;
			}
		},
	},
});
