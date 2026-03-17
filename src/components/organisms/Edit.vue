<template>
  <div class="uk-container uk-padding">
    <h1 class="uk-heading-primary">Draftanalyse bearbeiten</h1>

    <div data-uk-grid>
      <div class="uk-width-1-3@m">
        <div class="uk-text-meta uk-text-uppercase uk-margin-small-bottom">
          RFL Tools
        </div>

        <div class="uk-button-group">
          <a
            class="uk-button uk-button-secondary"
            href="https://jakesch.shinyapps.io/rfl-tools/#section-draftklassen"
            target="_blank"
            >Draftklassen</a
          >
          <a
            class="uk-button uk-button-secondary"
            href="https://jakesch.shinyapps.io/rfl-tools/#section-draftboards"
            target="_blank"
            >Draftboards</a
          >
        </div>
      </div>

      <div class="uk-width-expand@m">
        <Filter />
      </div>
    </div>

    <hr />

    <!-- <pre>{{ supabaseData.currentDraftClass }}</pre> -->
    <!-- <pre>{{ ownAnalysis }}</pre> -->

    <div data-uk-grid>
      <div class="uk-width-3-5@m">
        <div class="uk-padding-small uk-background-muted">
          <h2>Eigene Einschätzungen</h2>

          <ul class="uk-list uk-list-divider">
            <!-- nur picks der ersten drei runden -->
            <li
              v-for="draftPick in draftPicks.filter(
                (draftpick) => draftpick.round <= 3,
              )"
              :key="draftPick.id"
            >
              <div>
                <h3 class="uk-h4">{{ draftPick.title }}</h3>

                <img src="" alt="" />

                <!-- filter die eigenen analysen nach den draftpicks -->
                <!-- sortiere analysen nach jahr -->
                <ul
                  v-for="analysis in ownAnalysis
                    .filter((analysis) => analysis.pick === draftPick.id)
                    .sort((a, b) => a.year - b.year)"
                  :key="analysis.id"
                  class="uk-list"
                >
                  <li>
                    <h4 class="uk-h5">
                      <span
                        class="uk-background-muted uk-padding-small"
                        :data-grade="analysis.grade"
                        >{{ analysis.grade }}</span
                      >
                      {{ analysisTitle(analysis.year) }}
                    </h4>
                    <div v-html="markdown.render(analysis.text)"></div>
                    <!-- <pre>{{ analysis }}</pre> -->
                  </li>
                </ul>

                <!-- <pre>{{ draftPick }}</pre> -->
              </div>
            </li>
            <li>
              <h2 class="uk-h4">Late Round Picks</h2>
              <ul>
                <li
                  v-for="draftPick in draftPicks.filter(
                    (draftPick) => draftPick.round >= 4,
                  )"
                >
                  {{ draftPick.title }}
                </li>
              </ul>
            </li>
            <li>
              <h2 class="uk-h4">Trades</h2>
            </li>
            <li>
              <h2 class="uk-h4">Draftklasse</h2>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      class="uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-expand@m"
      data-uk-grid
    >
      <div
        v-if="
          supabaseData.filteredPick && supabaseData.filteredPick != 'trades'
        "
        class="uk-width-1-1 column-upload"
      >
        <UploadForm v-if="showUploadForm || !supabaseData.currentFile" />

        <div v-if="supabaseData.currentFile" class="uk-position-relative">
          <i
            class="uk-icon-button uk-position-top-right uk-position-small uk-background-primary"
            data-uk-icon="pencil"
            @click="toggleUploadForm()"
          ></i>
          <img :src="supabaseData.currentFile" class="uk-width-1-1" />
        </div>
      </div>

      <div v-if="supabaseData.showEditCard" class="uk-width-1-1 uk-width-1-2@m">
        <div class="uk-card uk-card-default uk-card-body">
          <EditForm :data="supabaseData.currentAnalysis" />
        </div>
      </div>

      <slot v-for="analysis in ownAnalysis" :key="analysis.id">
        <div
          v-if="analysis.id !== supabaseData.currentAnalysis?.id"
          :class="supabaseData.showEditCard ? 'uk-width-1-2@m' : ''"
        >
          <Card
            :card="{
              title: analysisTitle(analysis.year),
              image: analysis.pick.includes('trade') ? analysis.pick : null,
              meta: analysis.last_update,
              text: analysis.text,
              footer: `Note: ${analysis.grade}`,
            }"
            @edit="startEdit(analysis)"
          />
        </div>
      </slot>
      <div v-if="showAddColumn()" class="uk-width-1-3@m column-add">
        <div
          class="uk-card uk-card-muted uk-flex uk-flex-middle uk-flex-center"
          @click="supabaseData.showEditCard = true"
        >
          <i data-uk-icon="icon: plus; ratio: 3"></i>
        </div>
      </div>
    </div>

    <div
      v-if="otherAnalysis.length > 0"
      class="uk-background-muted uk-padding uk-margin-large-top"
    >
      <h2>Einschätzungen von Anderen</h2>

      <Card
        v-for="analysis in otherAnalysis"
        :card="{
          title: `Jahr ${analysis.year}`,
          meta: analysis.last_update,
          text: analysis.text,
          footer: `Note: ${analysis.grade}`,
        }"
      />

      <!-- <div v-html="markdown.render(otherAnalysis.text)"></div>
			<span class="uk-text-large">Note: {{ otherAnalysis.grade }}</span> -->
    </div>
  </div>
</template>

<script setup>
//
// Imports
//
// ========================================================================

import Filter from "@/components/organisms/forms/Filter.vue";
import Card from "@/components/organisms/Card.vue";
import EditForm from "@/components/organisms/forms/EditForm.vue";
import UploadForm from "@/components/organisms/forms/UploadForm.vue";
import MarkdownIt from "markdown-it";

import { useSupabaseStore } from "@/store/supabase";
import { ref, watch } from "vue";

//
// Constants
//
// ========================================================================

const supabaseData = useSupabaseStore();
const ownAnalysis = ref([]);
const otherAnalysis = ref([]);
const showUploadForm = ref(false);
const draftPicks = ref([]);
const markdown = new MarkdownIt();

//
// Functions
//
// ========================================================================

watch(
  // wenn sich die gewählte draftklasse ändert
  () => supabaseData.currentDraftClass,
  () => {
    // wenn filter für draftklasse und team gesetzt ist
    if (
      supabaseData.currentDraftClass &&
      supabaseData.currentDraftClass.length > 0
    ) {
      // filtere draftklasse nach eigenen einträgen
      ownAnalysis.value = supabaseData.currentDraftClass.filter(
        (entry) => entry.user_id == supabaseData.currentUser.id,
      );

      // filtere draftklasse nach einträgen von anderen
      otherAnalysis.value = supabaseData.currentDraftClass.filter(
        (entry) => entry.user_id != supabaseData.currentUser.id,
      );

      // lese die picks der gewählten draftklasse und des gewählten teams aus
      draftPicks.value = supabaseData.rflDrafts
        .filter(
          (entry) =>
            entry.season == supabaseData.filteredDraftClass &&
            entry.franchise_id == supabaseData.filteredTeam,
        )
        .map((entry) => {
          return {
            id: `${entry.round}_${entry.pick}`,
            title: `${entry.round}.${entry.pick} - ${entry.player_name} (${entry.pos}, ${entry.team})`,
            round: entry.round,
          };
        });
    }
  },
  { deep: true },
);

// Start Editing existing analysis
// ========================================================================

const startEdit = (analysis) => {
  supabaseData.currentAnalysis = analysis;

  supabaseData.showEditCard = true;
};

// Helper
// ========================================================================

const analysisTitle = (year) => {
  let title = "Nach";

  if (year > 0) {
    title += ` Jahr ${year}`;
  } else {
    title += " dem Draft";
  }

  return title;
};

const toggleEditMode = (event) => {
  const textElement = event.currentTarget;
  const textareaElement = textElement.nextElementSibling;

  textElement.hidden = true;
  textareaElement.hidden = false;
};

const showAddColumn = () => {
  if (
    supabaseData.filteredDraftClass &&
    supabaseData.filteredTeam &&
    supabaseData.filteredPick &&
    !supabaseData.showEditCard
  ) {
    return true;
  }

  return false;
};

const toggleUploadForm = () => {
  showUploadForm.value = true;
};
</script>

<style lang="scss" scoped>
.column-add {
  display: flex;

  @media screen and (max-width: 960px) {
    order: -1;
  }

  .uk-card {
    flex-grow: 1;
  }
}

.uk-card-muted {
  background-color: #f8f8f8;
  transition: background-color 0.3s;
  cursor: pointer;
  min-height: 150px;

  @media sreen and (min-width: 1200px) {
    min-height: 300px;
  }

  &:hover {
    background-color: #e8e8e8;
  }
}

.uk-icon-button {
  cursor: pointer;
}

.uk-button-group {
  gap: 2px;
  flex-wrap: wrap;
}
</style>
