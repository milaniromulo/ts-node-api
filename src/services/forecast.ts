import { ForecastPoint, StormGlass } from '@src/clients/StormGlass';
import { InternalError } from '@src/util/errors/internal-error';

export enum BeachesPosition{
    N = 'N',
    S = 'S',
    E = 'E',
    W = 'W'
}

export interface Beach{
    name: String,
    position: BeachesPosition,
    lat: Number,
    lng: Number,
    user: String
}

export interface Timeforecast{
    time: String,
    forecast: BeachForecast[]
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError{
    constructor(message: String){
        super(`Unexpected error during the forecast processing: ${message}`)
    }
}

export class Forecast {
    constructor( protected stormGlass = new StormGlass()){}

    public async processForecastForBeaches(beaches: Beach[]): Promise<Timeforecast[]> {
        const pointsWithCorrectSource: BeachForecast[] = [];

        try {
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
                const enrichedBeachData = this.enrichedBeachData(points, beach)
                pointsWithCorrectSource.push(...enrichedBeachData)
            }
    
            return this.mapForecastByTime(pointsWithCorrectSource);
            
        } catch (error) {
            throw new ForecastProcessingInternalError(error.message);
        }
    }

    private enrichedBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[]{
        return points.map((p) => ({
            ...{},
            ...{
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1,
            },
            ...p,
        }));
    }

    private mapForecastByTime(forecast: BeachForecast[]): Timeforecast[]{
        const forecastBytime: Timeforecast[] = [];

        for(const point of forecast){
            const timePoint = forecastBytime.find(f => f.time === point.time);

            if(timePoint){
                timePoint.forecast.push(point)
            }else{
                forecastBytime.push({
                    time: point.time,
                    forecast: [point]
                })
            }
        }

        return forecastBytime;
    }
}