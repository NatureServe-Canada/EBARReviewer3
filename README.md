# EBARReviewer3

## Setup
1. Download and install ArcGIS Experience Builder [Developer Edition](https://developers.arcgis.com/experience-builder/guide/downloads/).
2. Navigate to the `client/your-extensions/widgets/` folder and clone the repository.
3. Follow the instructions in the [installation guide](https://developers.arcgis.com/experience-builder/guide/install-and-configure/) to run the widget.

## Configuration
1. Add the Map widget and select the EBARReviewer3 map as the data source.
2. Add the Select widget and configure it as follows:
    - Go to the Content tab.
    - Under Source, select "Interact with a Map widget" radio button.
    - Choose the EBARReviewer3 map
    - Select only the Ecoshapes (generalized) layer.
3. Add the EBARReviewer3 widget to the canvas and configure it as follows:
    - Go to the Content tab.
    - Enable "Connect to data" toggle.
    - Select the Ecoshapes (generalized) layer from the EBARReviewer3 map.

## Build
1. Go to `client/your-extensions/widgets/` folder and run `npm run build:prod` to build the widget for production.
2. The compiled widget appears in the client/dist-prod/widgets directory.

