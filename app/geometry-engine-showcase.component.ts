import { Component, ViewChildren } from '@angular/core';

// Observables and RxJS
import { Control } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { EsriMapViewComponent } from './esri-map-view.component';
import geometryEngineAsync from 'esri/geometry/geometryEngineAsync';
import Graphic from 'esri/Graphic';
import SimpleFillSymbol from  'esri/symbols/SimpleFillSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';

@Component({
    selector: 'geometry-engine-showcase',
    styles: [`
        .workflow {
            font-style: italic;
            font-size: 0.8em;
        }
        .rangeSlider {
            margin: 0 10px;
            max-width: 200px;
            vertical-align: middle;
        }
        .label-override {
            margin-left: 0;
            margin-right: 1em;
        }
        .card pre {
            margin: 0 15px 20px 15px;
            width: auto;
        }
        `],
    template:
        `
        <h4>Vector GIS analysis with Esri's client-side geometry engine</h4>

        <esri-map-view #mapView (viewCreated)="setView(mapView.view)"
            zoom="6" centerLng="-18.5" centerLat="65" rotation="180">
        </esri-map-view>

        <span class="workflow">Workflow: create geodesic buffer &rarr; create convex hull &rarr; calculate buffer and convex hull areas</span>

        <p>Change the buffer distance to begin:</p>
        <div>
            <input type="range" min="10" max="300" value="30" step="5"
                class="rangeSlider"
                [ngFormControl]="bufferDistanceControl">
            <span>{{ bufferDistanceDisplay }} km</span>
        </div>

        <ul>
            <li>volcanoes buffered in extent: {{ featureCount }}</li>
            <li>unioned buffer area: {{ bufferPolygonSize | number:'1.1-1' }} km<sup>2</sup></li>
            <li>convex hull area: {{ convexHullPolygonSize | number:'1.1-1' }} km<sup>2</sup></li>
        </ul>

        <div class="card">
            <p><span class="label label-override">Info</span>This Esri map view was created with a custom Angular 2 component with several <code>@Input</code> bindings and an <code>EventEmitter()</code> event binding:</p>
            <pre>
<code>&lt;esri-map-view #mapView (viewCreated)="setView(mapView.view)"
    zoom="6" centerLng="-18.5" centerLat="65" rotation="180"&gt;
&lt;/esri-map-view&gt;</code>
            </pre>
        </div>
        `,
    directives: [EsriMapViewComponent]
})
export class GeometryEngineShowcaseComponent {
    viewReference: any;
    volcanoGeoms: any;
    analysisLayer: any;
    featureCount = 0;
    bufferPolygonSize = 0;
    convexHullPolygonSize = 0;

    bufferDistanceDisplay = 0;
    bufferDistanceControl = new Control();

    ngOnInit() {
        // when use moves slider
        // 1) live update UI
        this.bufferDistanceControl.valueChanges
            .subscribe(n => this.bufferDistanceDisplay = n);
        // 2) start analysis after user is done sliding
        this.bufferDistanceControl.valueChanges
            .debounceTime(250)
            .distinctUntilChanged()
            .subscribe(n => this.startAnalysis(n));
    }

    setView(viewRef) {
        this.viewReference = viewRef;

        // inspect layers in the map to create layer or layerView references
        this.viewReference.map.layers.forEach((layer) => {
            // here we need a layerView reference
            if (layer.id === 'volcanoesLayer') {
                this.viewReference.whenLayerView(layer).then((layerView) => {
                    layerView.watch('updating', (val) => {
                        if (!val) { // wait for the layer view to finish updating
                            layerView.queryFeatures().then((featureSet) => {
                                this.volcanoGeoms = featureSet.map(feature => feature.geometry); // prints the array of client-side graphics to the console
                            });
                        }
                    });
                });
            }
            // here we just need a layer reference
            if (layer.id === 'analysisLayer') {
                this.analysisLayer = layer;
            }
        });
    }

    startAnalysis(bufferDistance) {
        // STEP 0.A
        // filter to get point geometries within the current view extent
        var geomsInExtent = this.volcanoGeoms.filter(geom => this.viewReference.extent.contains(geom));

        // STEP 0.B
        // update template bindings
        // this.bufferDistanceDisplay = bufferDistance;
        this.featureCount = geomsInExtent.length;

        // STEP 1
        // calculate the geodesic buffer geometry with unioned outputs
        geometryEngineAsync.geodesicBuffer(geomsInExtent, bufferDistance, 'kilometers', true).then((bufferGeometries) => {
            var bufferGeometry = bufferGeometries[0];

            // STEP 1.A
            // calculate area and update template binding
            geometryEngineAsync.geodesicArea(bufferGeometry, 'square-kilometers').then((res) => {
                this.bufferPolygonSize = res;
            });

            // STEP 1.B
            // create a graphic to display the new unioned buffer geometry
            var bufferGraphic = new Graphic({
                geometry: bufferGeometry,
                symbol: new SimpleFillSymbol({
                    color: [227, 139, 79, 0.7],
                    outline: new SimpleLineSymbol({
                        color: [255, 255, 255],
                        width: 1
                    })
                })
            });

            // STEP 2
            // calculate the convex hull geometry
            geometryEngineAsync.convexHull(bufferGeometry, true).then((convexHullGeometry) => {

                // STEP 2.A
                // calculate area and update template binding
                geometryEngineAsync.geodesicArea(convexHullGeometry, 'square-kilometers').then((res) => {
                    this.convexHullPolygonSize = res;
                });

                // STEP 2.B
                // create a graphic to display the new convex hull geometry
                var convexHullGraphic = new Graphic({
                    geometry: convexHullGeometry,
                    symbol: new SimpleFillSymbol({
                        color: [255, 255, 255, 0],
                        outline: new SimpleLineSymbol({
                            color: [255, 255, 255],
                            width: 2
                        })
                    })
                });

                // STEP 3
                // add both the buffer and convex hull graphics to the map
                this.addAnalysisResultsToMap(bufferGraphic, convexHullGraphic)
            });

        });
    }

    addAnalysisResultsToMap(...analysisGraphics) {
        this.analysisLayer.removeAll();
        this.analysisLayer.addMany(analysisGraphics);
    }
}
