import { Request, Response } from "express";

import {
  DashboardDateRange,
  closeReasonsStatsService,
  geoByDddService,
  statusSummaryService,
  ticketsStatisticsService,
  usersReportService
} from "../services/ReportService/DashboardService";

export const ticketsStatistic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await ticketsStatisticsService(companyId, params);
  return res.status(200).json(result);
};

export const usersReport = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await usersReportService(companyId, params);
  return res.status(200).json(result);
};

export const statusSummary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const dashboardData = await statusSummaryService(companyId);
  return res.status(200).json(dashboardData);
};

export const closeReasonsStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await closeReasonsStatsService(companyId, params);
  return res.status(200).json(result);
};

export const geoByDdd = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const params: DashboardDateRange = req.query;
  const { companyId } = req.user;

  const result = await geoByDddService(companyId, {
    date_from: params.date_from,
    date_to: params.date_to,
    hour_from: params.hour_from,
    hour_to: params.hour_to,
    tz: params.tz
  });
  return res.status(200).json(result);
};
