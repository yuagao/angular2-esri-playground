System.register(['angular2/core', './map.service', './view-coordination.service', 'esri-mods'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, map_service_1, view_coordination_service_1, esri_mods_1;
    var EsriMapViewComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (map_service_1_1) {
                map_service_1 = map_service_1_1;
            },
            function (view_coordination_service_1_1) {
                view_coordination_service_1 = view_coordination_service_1_1;
            },
            function (esri_mods_1_1) {
                esri_mods_1 = esri_mods_1_1;
            }],
        execute: function() {
            EsriMapViewComponent = (function () {
                function EsriMapViewComponent(_mapService, _viewCoordinationService, elRef) {
                    this._mapService = _mapService;
                    this._viewCoordinationService = _viewCoordinationService;
                    this.elRef = elRef;
                    this.viewCreated = new core_1.EventEmitter();
                    this.view = null;
                }
                EsriMapViewComponent.prototype.ngOnInit = function () {
                    this.view = new esri_mods_1.MapView({
                        container: this.elRef.nativeElement.firstChild,
                        map: this._mapService.map,
                        zoom: this._viewCoordinationService.zoom,
                        center: this._viewCoordinationService.center,
                        rotation: this._viewCoordinationService.rotation
                    });
                    this.view.then(function (view) {
                        this.viewCreated.next(view);
                    }.bind(this));
                    this.view.watch('zoom,center,rotation', function (newVal, oldVal, propertyName) {
                        this._viewCoordinationService.setValue(newVal, propertyName);
                    }.bind(this));
                };
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], EsriMapViewComponent.prototype, "viewCreated", void 0);
                EsriMapViewComponent = __decorate([
                    core_1.Component({
                        selector: 'esri-map-view',
                        template: '<div></div>',
                        providers: [map_service_1.MapService /*, ViewCoordinationService*/]
                    }), 
                    __metadata('design:paramtypes', [map_service_1.MapService, view_coordination_service_1.ViewCoordinationService, core_1.ElementRef])
                ], EsriMapViewComponent);
                return EsriMapViewComponent;
            }());
            exports_1("EsriMapViewComponent", EsriMapViewComponent);
        }
    }
});
//# sourceMappingURL=esri-map-view.component.js.map