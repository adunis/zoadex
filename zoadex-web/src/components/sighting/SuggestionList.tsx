import { Lightbulb } from 'lucide-react';
import { Suggestion } from '../../types/suggestion';
import { getMacroCategory } from '../../types/species';

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSelect: (speciesId: string) => void;
}

function getCategoryEmoji(category: string): string {
  const macro = getMacroCategory(category as import('../../types/species').SpeciesCategory);
  switch (macro) {
    case 'PLANTS': return '🌿';
    case 'MUSHROOMS': return '🍄';
    case 'ANIMALS': return '🐾';
    default: return '🔍';
  }
}

export function SuggestionList({ suggestions, onSelect }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <div className="suggestion-list suggestion-list--empty">
        <Lightbulb size={24} />
        <p>Get your location to see species suggestions nearby</p>
      </div>
    );
  }

  return (
    <div className="suggestion-list">
      <h3 className="suggestion-list__title">
        <Lightbulb size={18} /> Suggested Near You
      </h3>
      <ul className="suggestion-list__items">
        {suggestions.map((suggestion) => (
          <li key={suggestion.speciesId} className="suggestion-list__item">
            <button
              className="suggestion-list__button"
              onClick={() => onSelect(suggestion.speciesId)}
            >
              <div className="suggestion-list__left">
                <span className="suggestion-list__emoji">
                  {getCategoryEmoji(suggestion.category)}
                </span>
                <div className="suggestion-list__info">
                  <span className="suggestion-list__name">{suggestion.commonName ?? suggestion.scientificName}</span>
                  <span className="suggestion-list__scientific">{suggestion.scientificName}</span>
                  <div className="suggestion-list__reasons">
                    {suggestion.reasons.map((reason) => (
                      <span key={reason} className="suggestion-list__reason">{reason}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="suggestion-list__confidence">
                <span className="suggestion-list__confidence-value">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
                <span className="suggestion-list__confidence-label">match</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
