import { defineStore } from "pinia";
import { supabase } from "@/js/supabase.js";

export const useSupabaseStore = defineStore("supabaseData", {
	state: () => {
		return {
			currentUser: null,
			rflTeams: [],
			rflDrafts: [],
			rflDraftOrder: [],
			selectedDraftAnalysis: [],
			ownAnalysis: [],
			otherAnalysis: [],
			gradeDraftClasses: [],
			teamTrades: [],
			selectedDraftClass: [],
			selectedDraftYear: "",
			filteredTeam: "",
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

		findDraftClass(teamID, year) {
			try {
				this.selectedDraftClass = this.rflDrafts.filter(
					(pick) => pick.franchise_id === teamID && pick.season === year,
				);
			} catch (error) {
				this.alertType = "error";
				this.alertMessage = error.message;
			}
		},

		async fetchRflDraftOrdersByYear(year) {
			if (!year || typeof year != "string") return;

			try {
				const { data, error } = await supabase
					.from("RFL Draftorders")
					.select()
					.eq("season", year);
				if (error) throw error;
				this.rflDraftOrder = data;
			} catch (error) {
				this.alertType = "error";
				this.alertMessage = error.message;
			}
		},

		// RFL Trades
		// ========================================================================

		async fetchteamTradesById(teamID) {
			try {
				const { data, error } = await supabase
					.from("RFL Trades")
					.select()
					.contains("franchise_ids", `{${teamID}}`);

				if (error) throw error;
				this.teamTrades = data;
			} catch (error) {
				this.alertType = "error";
				this.alertMessage = error.message;
			}
		},

		findTrades(string) {
			return this.teamTrades.filter((trade) => {
				return trade.asset_names.includes(string);
			});
		},

		// Analysen
		// ========================================================================

		async fetchDraftClassNotesByYear(draftClass) {
			try {
				const { data, error } = await supabase
					.from("Draftanalysen")
					.select()
					.eq("pick", "klasse")
					.eq("draft_class", draftClass);
				if (error) throw error;
				this.gradeDraftClasses = data;
			} catch (error) {
				this.alertType = "error";
				this.alertMessage = error.message;
			}
		},

		async fetchDraftClassAnalysis(draftClass, team) {
			try {
				const { data, error } = await supabase
					.from("Draftanalysen")
					.select()
					.eq("draft_class", draftClass)
					.eq("team_id", team);

				if (error) throw error;

				this.selectedDraftAnalysis = data;
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

		async deleteAnalysis(id) {
			try {
				const { data, error } = await supabase
					.from("Draftanalysen")
					.delete()
					.eq("id", id);

				if (error) throw error;
			} catch (error) {
				this.alertType = "error";
				this.alertMessage = error.message;
			}
		},

		setOwnAnalysis(analysis) {
			this.ownAnalysis = analysis;
		},

		// Files
		// ========================================================================

		async uploadFile(file, id) {
			if (!file) {
				this.alertType = "error";
				this.alertMessage = "Bitte waehle eine Datei aus.";
				return;
			}

			try {
				const fileExtension = file.value.name.split(".").pop();

				// const pick =
				// 	this.filteredPick == "trades"
				// 		? this.currentAnalysis.pick
				// 		: this.filteredPick;

				const filename = `${this.selectedDraftYear}_${this.filteredTeam}_${id}.${fileExtension}`;

				const { data, error } = await supabase.storage
					.from("Screenshots")
					.upload(filename, file.value, { upsert: true });

				if (error) throw error;

				this.upsertFileInfo({
					name: filename,
					draft_class: this.selectedDraftYear,
					team_id: this.filteredTeam,
					pick: id,
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
			try {
				const { data, error } = await supabase
					.from("Bilder")
					.select("name")
					.eq("draft_class", this.selectedDraftYear)
					.eq("team_id", this.filteredTeam)
					.eq("pick", pick);

				if (error) throw error;

				const url = this.getImgUrl(data[0]?.name);

				return url;
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
			this.selectedDraftYear = "";
			this.filteredTeam = "";
			this.filteredPick = "";
			this.alertMessage = null;
			this.alertType = null;
			this.currentFile = null;

			// TODO: update
		},
	},
});
