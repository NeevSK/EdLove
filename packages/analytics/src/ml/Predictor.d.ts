import type { PredictionRequest, PredictionResult } from '@/types/AnalyticsTypes';
export interface DatabaseClient {
  from: (table: string) => any;
}
export declare class Predictor {
  private db;
  constructor(db: DatabaseClient);
  /**
   * Generate predictions using ML models
   */
  predict(request: PredictionRequest): Promise<PredictionResult>;
  private predictGPA;
  private predictDropoutRisk;
  private predictPerformanceTrend;
  private calculateTrend;
  private getTimeMultiplier;
  private marksToGPA;
  private generateGPARecommendations;
  private generateDropoutRecommendations;
  private generateTrendRecommendations;
  private calculateMovingAverages;
  private calculateTrendFromMovingAverages;
  private calculateConsistency;
}
//# sourceMappingURL=Predictor.d.ts.map
