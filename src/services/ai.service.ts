import { config } from '../config';
import { prisma } from '../prisma';
import { SuggestMetadataInput, SemanticSearchInput } from '../schemas/ai.schema';

export async function suggestMetadata(dto: SuggestMetadataInput) {
  const title = dto.title.toLowerCase();

  let genre = 'General Fiction';
  let tags: string[] = ['book'];
  let description = `A book titled "${dto.title}"`;
  let confidence = 0.6;

  if (
    title.includes('program') ||
    title.includes('code') ||
    title.includes('software') ||
    title.includes('algorithm')
  ) {
    genre = 'Technology / Software Engineering';
    tags = ['programming', 'software-engineering', 'technology'];
    description = `A technical book covering software development concepts and practices. "${dto.title}" explores key programming principles.`;
    confidence = 0.85;
  } else if (
    title.includes('design') ||
    title.includes('pattern') ||
    title.includes('architecture')
  ) {
    genre = 'Technology / Software Design';
    tags = ['design-patterns', 'architecture', 'software-design'];
    description = `A book on software design principles and patterns. "${dto.title}" provides guidance on creating well-structured systems.`;
    confidence = 0.8;
  } else if (
    title.includes('science') ||
    title.includes('physics') ||
    title.includes('math')
  ) {
    genre = 'Science';
    tags = ['science', 'academic', 'non-fiction'];
    description = `An educational book about scientific concepts. "${dto.title}" delves into fundamental scientific principles.`;
    confidence = 0.75;
  } else if (
    title.includes('history') ||
    title.includes('war') ||
    title.includes('civilization')
  ) {
    genre = 'History';
    tags = ['history', 'non-fiction', 'educational'];
    description = `A historical narrative or analysis. "${dto.title}" examines significant events and their impact.`;
    confidence = 0.7;
  }

  if (dto.author) {
    description += ` By ${dto.author}.`;
  }

  return {
    genre,
    tags,
    description,
    confidence,
    provider: config.aiProvider,
  };
}

export async function semanticSearch(dto: SemanticSearchInput) {
  const limit = dto.limit || 5;
  const queryWords = dto.query.toLowerCase().split(/\s+/);

  const books = await prisma.book.findMany();

  const scored = books
    .map((book) => {
      const searchable =
        `${book.title} ${book.author} ${book.genre || ''} ${book.description || ''} ${book.tags || ''}`.toLowerCase();
      let matches = 0;
      for (const word of queryWords) {
        if (word.length > 2 && searchable.includes(word)) {
          matches++;
        }
      }
      const score = queryWords.length > 0 ? matches / queryWords.length : 0;
      return { book, score, matches };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    results: scored.map((r) => ({
      id: r.book.id,
      title: r.book.title,
      author: r.book.author,
      score: Math.round(r.score * 100) / 100,
      reason: `Matched ${r.matches} of ${queryWords.length} query terms in book metadata.`,
    })),
    provider: config.aiProvider,
  };
}
