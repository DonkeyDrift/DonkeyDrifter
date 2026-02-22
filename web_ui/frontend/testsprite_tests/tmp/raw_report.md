
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** frontend
- **Date:** 2026-02-22
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Load configuration successfully using a valid path
- **Test Code:** [TC001_Load_configuration_successfully_using_a_valid_path.py](./TC001_Load_configuration_successfully_using_a_valid_path.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Config path input field not found on page
- Load button not found on page
- 'Config loaded' text not visible on page
- "~/mycar" text not visible on page
- Page rendered blank with 0 interactive elements after navigation to /
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/edcb152e-ed1f-45a7-ae1c-67212a130b93
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Show error when configuration load fails for an invalid path
- **Test Code:** [TC002_Show_error_when_configuration_load_fails_for_an_invalid_path.py](./TC002_Show_error_when_configuration_load_fails_for_an_invalid_path.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Config path input field not found on page
- Load button not found on page
- Page contains 0 interactive elements; SPA did not load the configuration UI
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/2350f0cd-c30d-4b96-bda2-877174e6d59a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Load button is actionable after editing the config path
- **Test Code:** [TC003_Load_button_is_actionable_after_editing_the_config_path.py](./TC003_Load_button_is_actionable_after_editing_the_config_path.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/f3bc64f0-ac09-457c-b645-e06c63e99cec
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Whitespace-trimmed path input still loads successfully
- **Test Code:** [TC004_Whitespace_trimmed_path_input_still_loads_successfully.py](./TC004_Whitespace_trimmed_path_input_still_loads_successfully.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Config loaded success message not found after clicking 'Load config'.
- Normalized path '~/mycar' not displayed after attempting to load the config.
- Page currently shows 0 interactive elements after the interaction, preventing verification of UI behavior.
- The SPA appears to have become unresponsive or blank after the load attempt, so the feature cannot be validated.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/f2f7d194-a1f1-413d-bdba-e8f03bef8996
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Attempting to load with an empty config path shows a visible failure state
- **Test Code:** [TC005_Attempting_to_load_with_an_empty_config_path_shows_a_visible_failure_state.py](./TC005_Attempting_to_load_with_an_empty_config_path_shows_a_visible_failure_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/975f375d-03e4-4866-8243-d5db9a7507ce
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Status bar updates from previous state after a successful load
- **Test Code:** [TC006_Status_bar_updates_from_previous_state_after_a_successful_load.py](./TC006_Status_bar_updates_from_previous_state_after_a_successful_load.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Config loaded confirmation text not found on the page after clicking 'Load config'.
- The page still displays 'No records loaded' indicating the UI did not update to show a loaded config.
- The config input shows '/home/dkc/projects/mycar' (or its placeholder/help text) but no visible status or confirmation referencing this path was found.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/bdb12586-20d9-48fc-b5e9-6336ab229856
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Error state is visible after switching from a successful load to an invalid path
- **Test Code:** [TC007_Error_state_is_visible_after_switching_from_a_successful_load_to_an_invalid_path.py](./TC007_Error_state_is_visible_after_switching_from_a_successful_load_to_an_invalid_path.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Config path input field not found on page
- Load button not found on page
- 'Config loaded' message not visible after submitting a valid path
- 'Error' message not visible after submitting an invalid path
- 'No config loaded' status not visible after load failure
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/4c7d9d5c-50bc-4ed5-bebd-21cf0dcb04c3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Load a valid tub from a relative path and verify metadata is shown
- **Test Code:** [TC008_Load_a_valid_tub_from_a_relative_path_and_verify_metadata_is_shown.py](./TC008_Load_a_valid_tub_from_a_relative_path_and_verify_metadata_is_shown.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Load tub failed with error banner 'Error: Directory not found' displayed.
- Tub Navigator shows 'No records loaded' after attempting to load './data'.
- No 'Loading' or 'Success' messages appeared following the Load action.
- Tub path input contained './data' but the application reported the directory does not exist, preventing records/fields from being shown.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/d476a63c-616a-4b2b-a358-1c241a203489
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Load a non-existent tub path and verify error state and status bar
- **Test Code:** [TC009_Load_a_non_existent_tub_path_and_verify_error_state_and_status_bar.py](./TC009_Load_a_non_existent_tub_path_and_verify_error_state_and_status_bar.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub path input field not found as an interactive element on the page.
- 'Load' button not found as an interactive element on the page.
- Page reports 0 interactive elements after waiting, preventing any typing or clicking required by the test.
- Could not verify the 'Error' message or the 'No tub loaded' status because interactions were not possible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/bede99cb-8436-41d1-8057-2a2d0dfcdc8c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Attempt to load with an empty tub path and verify an error is shown
- **Test Code:** [TC010_Attempt_to_load_with_an_empty_tub_path_and_verify_an_error_is_shown.py](./TC010_Attempt_to_load_with_an_empty_tub_path_and_verify_an_error_is_shown.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub path input field not found on page
- Page rendered blank / SPA failed to load; 0 interactive elements present
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/22e0cbd8-5050-4248-b451-84f1f36961cc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Verify loading indicator appears when starting a tub load
- **Test Code:** [TC011_Verify_loading_indicator_appears_when_starting_a_tub_load.py](./TC011_Verify_loading_indicator_appears_when_starting_a_tub_load.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Text 'Loading' not displayed on page after clicking 'Load tub'.
- Status bar element not present or visible after clicking 'Load tub'.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/af9cd02a-0e5f-40cb-b6f0-a34c13f234a7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Load a valid tub after a failed load and verify success replaces the error state
- **Test Code:** [TC012_Load_a_valid_tub_after_a_failed_load_and_verify_success_replaces_the_error_state.py](./TC012_Load_a_valid_tub_after_a_failed_load_and_verify_success_replaces_the_error_state.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub path input field not found on page
- Load button not found on page
- SPA did not render; page shows 0 interactive elements
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/7a26331a-4f48-41e1-b7ab-83223b1d5219
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Load a second tub path and verify the status bar updates to the new record count
- **Test Code:** [TC013_Load_a_second_tub_path_and_verify_the_status_bar_updates_to_the_new_record_count.py](./TC013_Load_a_second_tub_path_and_verify_the_status_bar_updates_to_the_new_record_count.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub path input field not found on page
- Load button not found on page
- SPA did not render: page contains 0 interactive elements and appears blank after navigation and waiting
- Required UI elements for loading/re-loading a tub are missing, preventing further test steps
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/2b338e78-5e0c-45df-bbf9-4ac5c0d8fa7c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Enter a tub path with leading/trailing spaces and verify load behavior is handled
- **Test Code:** [TC014_Enter_a_tub_path_with_leadingtrailing_spaces_and_verify_load_behavior_is_handled.py](./TC014_Enter_a_tub_path_with_leadingtrailing_spaces_and_verify_load_behavior_is_handled.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub path input field not found as an interactive element on the page (page reports 0 interactive elements).
- Load tub button not found as an interactive element on the page.
- Unable to enter the value "  ./data  " or trigger the load action because the interactive controls are not exposed to the test agent.
- "Loading" and "Success" messages could not be verified because the load action could not be initiated.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/979a707b-89f6-498d-8a1e-32a5c9d597ed
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Load main page and display current tub record image and metadata
- **Test Code:** [TC015_Load_main_page_and_display_current_tub_record_image_and_metadata.py](./TC015_Load_main_page_and_display_current_tub_record_image_and_metadata.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub Navigator displays "No records loaded" and therefore no initial record image is present.
- Current record metadata element is not present within the Tub Navigator on first load.
- Play button is not present in the Tub Navigator on first load.
- FPS display (playback status) is not visible in the Tub Navigator on first load.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/c40f1029-ece6-4bc3-8326-e650b9cfb222
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Next advances one record and updates the displayed image
- **Test Code:** [TC016_Next_advances_one_record_and_updates_the_displayed_image.py](./TC016_Next_advances_one_record_and_updates_the_displayed_image.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub Navigator shows the message 'No records loaded' after attempting to load the tub.
- No 'current record image' element is present on the page to verify image updates.
- No 'Next' button or record navigation controls are present on the page.
- It is not possible to verify that clicking 'Next' advances to the next record because no records are loaded.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/1454b73d-c92c-460b-889e-39736e2de964
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Previous navigates back one record and updates the displayed image
- **Test Code:** [TC017_Previous_navigates_back_one_record_and_updates_the_displayed_image.py](./TC017_Previous_navigates_back_one_record_and_updates_the_displayed_image.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub Navigator shows 'No records loaded', so no records are available to navigate.
- No 'Next' or 'Previous' navigation buttons were found on the page to perform the requested navigation.
- No 'current record image' preview element is present to verify image updates after navigation.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/baa46ff9-6f93-4563-851c-529cc6eef628
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 First jumps to start of tub and Last jumps to end
- **Test Code:** [TC018_First_jumps_to_start_of_tub_and_Last_jumps_to_end.py](./TC018_First_jumps_to_start_of_tub_and_Last_jumps_to_end.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Last button not found on page
- First button not found on page
- 'current record metadata' element not visible on page
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/46e5c3a1-e115-4ec4-9f51-e575e6e715a7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Render steering and throttle line chart when tub data is available
- **Test Code:** [TC019_Render_steering_and_throttle_line_chart_when_tub_data_is_available.py](./TC019_Render_steering_and_throttle_line_chart_when_tub_data_is_available.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Tub Chart text not found on the page.
- Line chart SVG element not visible on the page.
- 'Steering' label/text not found on the page.
- 'Throttle' label/text not found on the page.
- Tub data not loaded — the UI displays 'No records loaded' (no records to render the chart), preventing chart series from appearing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/1f33792d-31b7-4bff-af1d-e1af08aec903
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Empty chart placeholder appears when chart data is not loaded
- **Test Code:** [TC020_Empty_chart_placeholder_appears_when_chart_data_is_not_loaded.py](./TC020_Empty_chart_placeholder_appears_when_chart_data_is_not_loaded.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/d1cd0820-0c91-482a-a9cc-8234faa5a59f
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Error message is shown with empty chart state when data fails to load
- **Test Code:** [TC021_Error_message_is_shown_with_empty_chart_state_when_data_fails_to_load.py](./TC021_Error_message_is_shown_with_empty_chart_state_when_data_fails_to_load.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/e2f7caf5-6d2f-457c-a677-7961c52f7dc0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Apply valid temporary filter and verify filtered record count updates
- **Test Code:** [TC022_Apply_valid_temporary_filter_and_verify_filtered_record_count_updates.py](./TC022_Apply_valid_temporary_filter_and_verify_filtered_record_count_updates.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Data Cleaner panel header/button not found on page
- Filter expression input for entering 'user_throttle>0.1' not found on page
- 'Apply filter' button not found on page
- 'Filtered' indicator not visible on page
- 'Filtered record count' element not visible on page
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/9481f1e6-d37a-48a7-9d37-e3f4c88b0662
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Delete records by index range with confirmation and verify success feedback
- **Test Code:** [TC023_Delete_records_by_index_range_with_confirmation_and_verify_success_feedback.py](./TC023_Delete_records_by_index_range_with_confirmation_and_verify_success_feedback.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Data Cleaner panel not found on the Tub Manager page; no controls labeled 'Data Cleaner' are present.
- 'Delete' button for index-range deletion is not present on the current page.
- 'Confirm' modal text cannot be observed because the deletion feature is missing.
- 'Success' message cannot be verified because index-range deletion functionality is not available.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/e90bbbf1-3af3-4530-89a7-7b3cdf7b8d3d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 End-to-end: Apply filter then delete index range and verify record count and chart update
- **Test Code:** [TC024_End_to_end_Apply_filter_then_delete_index_range_and_verify_record_count_and_chart_update.py](./TC024_End_to_end_Apply_filter_then_delete_index_range_and_verify_record_count_and_chart_update.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- ASSERTION: Data Cleaner panel/button not found on page.
- ASSERTION: Required UI elements for the cleaning workflow (filter input, Apply filter button, index range inputs, Delete button, confirmation modal, chart) are not present, so the workflow cannot be executed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/36a175ad-7a4b-44a4-bbb8-72436b2b3d59
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Invalid filter expression shows validation error and does not apply filter
- **Test Code:** [TC025_Invalid_filter_expression_shows_validation_error_and_does_not_apply_filter.py](./TC025_Invalid_filter_expression_shows_validation_error_and_does_not_apply_filter.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Data Cleaner panel/header/button not found on page
- No interactive elements present on page (0 found); cannot enter filter expression or click Apply filter
- SPA did not load; page appears blank, preventing the required validation check
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/b8a14d62-c61c-4188-9733-e1929268d6a5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Fix invalid filter to valid and successfully apply after seeing error
- **Test Code:** [TC026_Fix_invalid_filter_to_valid_and_successfully_apply_after_seeing_error.py](./TC026_Fix_invalid_filter_to_valid_and_successfully_apply_after_seeing_error.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Data Cleaner panel not found on page
- Filter expression input field not found on page
- Apply filter button not found on page
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/aeace627-f777-4139-be52-964355064893
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Cancel out of invalid filter state without applying changes
- **Test Code:** [TC027_Cancel_out_of_invalid_filter_state_without_applying_changes.py](./TC027_Cancel_out_of_invalid_filter_state_without_applying_changes.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Data Cleaner panel or button not found on page; cannot perform invalid filter workflow
- Filter expression input for Data Cleaner not present on page
- 'Apply filter' control not present, so cannot trigger invalid filter state
- 'Cancel' control for the invalid filter workflow not present
- Verification of 'Invalid' visibility could not be performed because workflow controls are missing
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/d8965b6a-fb87-488c-9252-4868d748b927
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Deletion confirmation modal can be dismissed without deleting
- **Test Code:** [TC028_Deletion_confirmation_modal_can_be_dismissed_without_deleting.py](./TC028_Deletion_confirmation_modal_can_be_dismissed_without_deleting.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Data Cleaner panel not reachable: page rendered blank and no interactive elements are present at http://localhost:5173
- Page at http://localhost:5173 shows a blank viewport after waiting 2s and 3s
- No clickable Data Cleaner header/button found on the page
- Cannot verify deletion confirmation modal because UI elements required for the test are missing
- SPA likely failed to load or frontend crashed, preventing further testing
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/c16bbdd6-565b-4727-9009-48f8a7b97fd7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Status bar remains visible while navigating within the main console sections
- **Test Code:** [TC029_Status_bar_remains_visible_while_navigating_within_the_main_console_sections.py](./TC029_Status_bar_remains_visible_while_navigating_within_the_main_console_sections.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5ad15904-0ef6-4148-9a65-d041e5a9d543/da98508c-7952-4434-9860-be526ab32e5e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **17.24** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---