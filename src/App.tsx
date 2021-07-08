import React, { useEffect, useState } from 'react'
import PathDetails from '@/pathDetails/PathDetails'
import styles from './App.module.css'
import {
    getApiInfoStore,
    getErrorStore,
    getMapOptionsStore,
    getPathDetailsStore,
    getQueryStore,
    getRouteStore,
    getViewportStore,
    getLocationStore
} from '@/stores/Stores'
import TurnNavigation from '@/turnNavigation/TurnNavigation'
import MapComponent from '@/map/Map'
import { ApiInfo } from '@/api/graphhopper'
import MapOptions from '@/map/MapOptions'
import MobileSidebar from '@/sidebar/MobileSidebar'
import { useMediaQuery } from 'react-responsive'
import RoutingResults from '@/sidebar/RoutingResults'
import PoweredBy from '@/sidebar/PoweredBy'
import { QueryStoreState } from '@/stores/QueryStore'
import { RouteStoreState } from '@/stores/RouteStore'
import { MapOptionsStoreState } from '@/stores/MapOptionsStore'
import { ErrorStoreState } from '@/stores/ErrorStore'
import Search from '@/sidebar/search/Search'
import ErrorMessage from '@/sidebar/ErrorMessage'
import { ViewportStoreState } from '@/stores/ViewportStore'
import createPathDetailsLayer from '@/layers/PathDetailsLayer'
import createQueryPointsLayer from '@/layers/QueryPointsLayer'
import createPathsLayer from '@/layers/PathsLayer'
import createCurrentLocationLayer from '@/layers/CurrentLocationLayer'
import { MapLayer } from '@/layers/MapLayer'
import { LocationStoreState } from './stores/LocationStore'

export default function App() {
    const [query, setQuery] = useState(getQueryStore().state)
    const [info, setInfo] = useState(getApiInfoStore().state)
    const [route, setRoute] = useState(getRouteStore().state)
    const [location, setLocation] = useState(getLocationStore().state)
    const [error, setError] = useState(getErrorStore().state)
    const [mapOptions, setMapOptions] = useState(getMapOptionsStore().state)
    const [pathDetails, setPathDetails] = useState(getPathDetailsStore().state)
    const [viewport, setViewport] = useState(getViewportStore().state)

    useEffect(() => {
        const onQueryChanged = () => setQuery(getQueryStore().state)
        const onInfoChanged = () => setInfo(getApiInfoStore().state)
        const onRouteChanged = () => setRoute(getRouteStore().state)
        const onErrorChanged = () => setError(getErrorStore().state)
        const onMapOptionsChanged = () => setMapOptions(getMapOptionsStore().state)
        const onLocationChanged = () => setLocation(getLocationStore().state)
        const onPathDetailsChanged = () => setPathDetails(getPathDetailsStore().state)
        const onViewportChanged = () => setViewport(getViewportStore().state)

        getQueryStore().register(onQueryChanged)
        getApiInfoStore().register(onInfoChanged)
        getRouteStore().register(onRouteChanged)
        getErrorStore().register(onErrorChanged)
        getMapOptionsStore().register(onMapOptionsChanged)
        getLocationStore().register(onLocationChanged)
        getPathDetailsStore().register(onPathDetailsChanged)
        getViewportStore().register(onViewportChanged)

        return () => {
            getQueryStore().deregister(onQueryChanged)
            getApiInfoStore().deregister(onInfoChanged)
            getRouteStore().deregister(onRouteChanged)
            getErrorStore().deregister(onErrorChanged)
            getMapOptionsStore().deregister(onMapOptionsChanged)
            getLocationStore().deregister(onLocationChanged)
            getPathDetailsStore().deregister(onPathDetailsChanged)
            getViewportStore().deregister(onViewportChanged)
        }
    })

    const isSmallScreen = useMediaQuery({ query: '(max-width: 44rem)' })

    const mapLayers: MapLayer[] = [
        createQueryPointsLayer(query.queryPoints),
        createPathsLayer(route.selectedPath, route.routingResult.paths),
        createCurrentLocationLayer(location.coordinate)
    ]
    if (!isSmallScreen) mapLayers.push(createPathDetailsLayer(pathDetails))

    return (
        <div className={styles.appWrapper}>
            {isSmallScreen ? (
                <SmallScreenLayout
                    query={query}
                    route={route}
                    location={location}
                    viewport={viewport}
                    mapLayers={mapLayers}
                    mapOptions={mapOptions}
                    error={error}
                    info={info}
                />
            ) : (
                <LargeScreenLayout
                    query={query}
                    route={route}
                    location={location}
                    viewport={viewport}
                    mapLayers={mapLayers}
                    mapOptions={mapOptions}
                    error={error}
                    info={info}
                />
            )}
        </div>
    )
}

interface LayoutProps {
    query: QueryStoreState
    route: RouteStoreState
    location: LocationStoreState
    viewport: ViewportStoreState
    mapLayers: MapLayer[]
    mapOptions: MapOptionsStoreState
    error: ErrorStoreState
    info: ApiInfo
}

function LargeScreenLayout({ query, route, location, viewport, mapLayers, error, mapOptions, info }: LayoutProps) {
    return (
        <>
            <div className={styles.map}>
                {
                    <MapComponent
                        viewport={viewport}
                        mapStyle={mapOptions.selectedStyle}
                        queryPoints={query.queryPoints}
                        mapLayers={mapLayers}
                    />
                }
            </div>
            <div className={styles.mapOptions}>
                <MapOptions {...mapOptions} />
            </div>
            {location.turnNavigation ? (
                <div className={styles.turnNavigation}>
                    <TurnNavigation path={route.selectedPath} location={location} />
                </div>
            ) : (
                <div className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        <div>{!error.isDismissed && <ErrorMessage error={error} />}</div>
                        <div>
                            <div className={styles.search}>
                                <Search
                                    points={query.queryPoints}
                                    routingProfiles={info.profiles}
                                    selectedProfile={query.routingProfile}
                                />
                            </div>
                            <div className={styles.routingResult}>
                                <RoutingResults
                                    paths={route.routingResult.paths}
                                    selectedPath={route.selectedPath}
                                    currentRequest={query.currentRequest}
                                />
                            </div>
                            <div className={styles.poweredBy}>
                                <PoweredBy />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.pathDetails}>
                <PathDetails selectedPath={route.selectedPath} />
            </div>
        </>
    )
}

function SmallScreenLayout({ query, route, location, viewport, mapLayers, error, mapOptions, info }: LayoutProps) {
    return (
        <>
            <div className={styles.smallScreenMap}>
                <MapComponent
                    viewport={viewport}
                    queryPoints={query.queryPoints}
                    mapStyle={mapOptions.selectedStyle}
                    mapLayers={mapLayers}
                />
            </div>
            <div className={styles.smallScreenMapOptions}>
                <div className={styles.smallScreenMapOptionsContent}>
                    <MapOptions {...mapOptions} />
                </div>
            </div>
            {location.turnNavigation ? (
                <div className={styles.turnNavigation}>
                    <TurnNavigation path={route.selectedPath} location={location} />
                </div>
            ) : (
                <div className={styles.smallScreenSidebar}>
                    <MobileSidebar info={info} query={query} route={route} error={error} />
                </div>
            )}
            {!location.turnNavigation ? (
                <div className={styles.smallScreenRoutingResult}>
                    <RoutingResults
                        paths={route.routingResult.paths}
                        selectedPath={route.selectedPath}
                        currentRequest={query.currentRequest}
                    />
                </div>
            ) : null}
            {!location.turnNavigation ? (
                <div className={styles.smallScreenPoweredBy}>
                    <PoweredBy />
                </div>
            ) : null}
        </>
    )
}
