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

		// async upsertUserLeagues(importData) {
		// 	const { data, error } = await supabase
		// 		.from("userLeagues")
		// 		.upsert(importData, { onConflict: ["league_id"] })
		// 		.select();
		// 	if (error) {
		// 		console.error(error);
		// 	}
		// },
		// async deleteUserLeagues(leagues) {},
		// User Teams
		// ========================================================================
		// async readUserTeams() {
		// 	// fetch supabase data
		// 	let { data: userTeams, error } = await supabase
		// 		.from("userTeams")
		// 		.select("team_id,team_data,roster_data");
		// 	// set state
		// 	this.userTeams = userTeams;
		// },
		// async upsertUserTeams(importData) {
		// 	const { data, error } = await supabase
		// 		.from("userTeams")
		// 		.upsert(importData, { onConflict: ["team_id"] })
		// 		.select();
		// 	if (error) {
		// 		console.error(error);
		// 	}
		// },
		// User Rosters
		// ========================================================================
		// async writeUserRosters(importData) {
		// 	const { data, error } = await supabase
		// 		.from("userTeams")
		// 		.update({roster_data: importData.roster_data, last_modified: new Date()})
		// 		.eq("team_id", importData.team_id)
		// 		.select();
		// 	if (error) {
		// 		console.error(error);
		// 	}
		// }
	},
});
