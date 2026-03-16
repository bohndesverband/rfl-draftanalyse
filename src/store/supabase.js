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
		};
	},
	actions: {
		// Session
		// ========================================================================

		async getSession() {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (error) {
				console.error(error);
				return null;
			}

			this.currentUser = session?.user || null;
		},

		// User
		// ========================================================================

		async getCurrentUser() {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				console.error(error);
				return null;
			}

			this.currentUser = user;
		},

		async signOut() {
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error(error);
			}

			this.currentUser = null;
		},

		// RFL Teams
		// ========================================================================

		async fetchRflTeams() {
			const { data, error } = await supabase.from("RFL Teams").select();

			if (error) {
				console.error(error);
				return;
			}

			this.rflTeams = data;
		},

		// RFL Drafts
		// ========================================================================

		async fetchRflDrafts() {
			const { data, error } = await supabase.from("RFL Drafts").select();

			if (error) {
				console.error(error);
				return;
			}

			this.rflDrafts = data;
		},

		// Analysen
		// ========================================================================

		async readAnalysis(draftClass, team, pick) {
			const { data, error } = await supabase
				.from("Draftanalysen")
				.select()
				.eq("draft_class", draftClass)
				.eq("team_id", team)
				.eq("pick", pick);

			if (error) {
				console.error(error);
				return;
			}

			this.currentPlayerAnalysis = data;
		},

		async upsertAnalysis(importData) {
			const { data, error } = await supabase
				.from("Draftanalysen")
				.upsert(importData, { onConflict: "id" });
			if (error) {
				console.error(error);
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
