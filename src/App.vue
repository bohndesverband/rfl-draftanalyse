<template>
	<router-view></router-view>
</template>

<script setup>
import { onMounted } from "vue";
import { useSupabaseStore } from "@/store/supabase";

const supabaseData = useSupabaseStore();

onMounted(async () => {
	await supabaseData.getCurrentUser();
	await supabaseData.fetchRflTeams();
	await supabaseData.fetchRflDrafts();
});
</script>
