import { Request, Response } from "express";
import { SearchService } from "../services/searchService";

interface SearchQuery {
  q: string;
  page?: string;
  limit?: string;
}

export const search = async (req: Request, res: Response) => {
  try {
    const { q: query, page = "1", limit = "20" } = req.query as unknown as SearchQuery;
    const userId = req.user?._id;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: "Search query must be at least 2 characters"
      });
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const results = await SearchService.search(
      query.trim(),
      userId,
      parseInt(page),
      Math.min(parseInt(limit), 50) // Max 50 per page
    );

    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    return res.status(500).json({
      error: "Search failed"
    });
  }
};
