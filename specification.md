# EBAR Reviewer Application Specification

## Widgets
- Select
- About
- Add Data
- Legend
- Layer List
- Basemap Gallery
- Bookmarks
- Ebar Reviewer 3

## Behavior
- [ ] On Start
    - [ ] Display About widget
    - [ ] Open Select and Eber Reviewer 3 widgets
    - [ ] Disable Select if Taxa/Species are not selected

### Widget
- [ ] Start up
    - [x] Fetch Taxa/Species
      - [x] Filter Species Table on username and includeinebarreviewer=1
      - [ ] Order by Taxa/Species Name?
    - [x] Set Date Started to current date

- [x] On Species Select
  - [x] Display Range Info attributes
  - [x] Display Presence, Usage Type, and their markup features
    - Filter Presence layer on an rangemapid
    - Filter Presence Markup layer on reviewid and markup is not null
    - If DifferentiateUsageType = 1
      - Filter Usage Type layer on rangemapid
      - Filter Usage Type Markup layer on reviewid
  - [x] Zoom to the combined extent of all the above layers
  - [x] If Review is already submitted
    - [x] Display Warning on both Species Overview page, and Overall Feedback page
    - [x] Disable Save, and Submit buttons on the Overall Feedback page
    - [ ] Disable form fields on the Overall Feedback and Markup pages


- [ ] On Ecoshape(s) Select:
  - [x] Display Specie Feedback Page
  - [x] If Review is already submitted
    - [x] Disable Save, and Delete markup buttons
    - [x] Display Warning
  - [ ] If Single Ecoshape
    - [x] Fill (RangeMap)Ecoshape attributes
        - [x] Fill Parent Ecoregion, Ecozone, Terrestrial Area, Species, and Metadata attributes
        - [x] If Ecoshape in range, fill Presence/usage Type attributes
    - [x] Populate Presence Markup dropdown list
      - [x] If ecoshape is not in range - populate dropdown with **Present**, **Presence Expected**, and **Historical** options
      - [x] If ecoshape is in range
        - [x] Include Remove option
        - [x] Exclude the Ecoshape's own presence value from the dropdown options. For example, if the Ecoshape has a presence value of **Historical**, that option should not appear in the list.
      - [x] If the selected Presence Markup option is **Remove**
        - [x] Display Removal Reason dropdown list. Unlike Presence markup, this is a static list
        - [x] Make Removal Reason dropdown a required input
    - [x] If range Differentiates UsageType display Usage Type Markup dropdown, or else hide it
        - [x] Enable Usage Type Markup dropdown
            - [x] If the selected Ecoshape is in Presence range
            - [x] If the selected Ecoshape is **outside the range, but has Presence Markup**
            - [x] Dropdown options - the dropdown is conditionally populated with Breeding, Possible Breeding, and Non Breeding options
              - [x] If the selected ecoshape is in range but does not have Usage Type - populate Breeding, Possible Breeding
              - [x] If the selected ecoshape is in range and does have Usage Type
                - [x] Add Non Breeding option
                - [x] Remove the existing value from the dropdown. For e.g., if the selected ecoshape has Usage Type value Breeding - populate dropdown with Possible Breeding, and Non-Breeding options
        - [ ] Disable Usage Type Markup dropdown and unset the value
          - [x] If the selected Ecoshape is outside the range
          - [x] If the selected Ecoshape **is in range, but has Presence Markup Remove**

    - [x] On Delete Markup
        - [x] Presence Markup should be deleted
        - [x] If present, Usage Type Markup should be deleted
        - [x] If both are present, then both markups should be deleted
    - [x] On Back Button
        - [x] Clear Selection
        - [x] Navigate back to Species Overview Page
  - [ ] If Multiple Ecoshapes
    - [x] Hide RangeMap Ecoshape attributes
    - [x] Show "Multiple Ecoshapes Selected" and provide Existing Markup warning
    - [x] Populate the Presence Markup dropdown list with Present, Presence Expected, Historical, and Remove options
      - [x] Only Conditionally Populate Presence markup dropdown, in the following cases
        - [x] If all selected ecoshapes are in range, populate dropdown with Present, Presence Expected, and Historical options
          - [x] If all selected ecoshapes are of the same Presence Markup, remove that option from the dropdown
        - [x] If all selected ecoshapes are outside the range, populate dropdown with Present, Presence Expected, Historical
    - [x] On Save Markup
      - [x] Only apply markup to a selected ecoshape if that markup is valid
        - [x] If the selected ecoshape is in range, and the selected markup is Present
          - [x] Apply markup to all selected ecoshapes, except the ecoshapes that already have the same Presence value
          - [x] Update the comments/references for the ecoshapes that already have the same markup
            - [x] Update removes any existing references, if the current operation does not have any references
    - [x] If range differentiates Usage Type
      - [x] Populate Usage Type Markup dropdown with Breeding, Possible Breeding, Non Breeding options
        - [x] If all the selected ecoshapes are in range but does not have Usage Type - populate Breeding, Possible Breeding
        - [x] If all the selected ecoshapes are of the same Usage Type, remove that option from the dropdown
        - [x] If the selected ecoshape is in range and does have Usage Type
          - [x] Add Non Breeding option
          - [x] Remove the existing value from the dropdown. For e.g., if the selected ecoshape has Usage Type value Breeding - populate dropdown with Possible Breeding, and Non-Breeding options

- [x] On Save Markup
  - [x] Save to database
  - [x] Clear Selection
  - [x] Navigate to Species Overview Page
  - [ ] Save comment without markup

- [x] On Delete Markup
  - [x] Save to database
  - [x] Clear Selection
  - [x] Navigate to Species Overview Page

- [x] Overall Feedback Page
  - [x] Fill any existing rating and comments
  - [x] Back Button naviagates to Species Overview Page
  - [x] Save to database
    - [x] Alert if no rating is provided. Comments are optional
    - [x] Navigate to Species Overview Page
  - [x] Submit to database
    - [x] Alert that they cannot edit the review after submission
    - [x] Alert if no rating is provided. Comments are optional
    - [x] Navigate to Species Overview Page

- [x] French version of the app

### Layers
1. ReviewRangeMapSpecies
2. Species Range Ecoshapes (generalized)
3. Presence Markup
4. Usage Type
5. Usage Type Markup
6. Review
7. Ecoshapes (generalized)
8. EcoshapeReview

> [!IMPORTANT]
> The widget relies on exact layer names to filter data and apply edits. Therefore, the layers **must** be named exactly as listed above.
