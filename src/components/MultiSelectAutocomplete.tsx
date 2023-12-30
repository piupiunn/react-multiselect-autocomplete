import React, { useState, useEffect, KeyboardEvent } from "react";
import axios from "axios";

/**
 * Karakter verilerini temsil eden bir nesne.
 * @property {number} id - Karakterin benzersiz kimliği.
 * @property {string} name - Karakterin adı.
 * @property {string} image - Karakterin resim URL'si.
 * @property {number} episodeCount - Karakterin bölüm sayısı.
 */
type Character = {
  id: number;
  name: string;
  image: string;
  episodeCount: number;
};

/**
 * Çoklu Seçim Otomatik Tamamlama bileşeni.
 * @component
 */
const MultiSelectAutocomplete: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [searchResults, setSearchResults] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [focusedSelectedIndex, setFocusedSelectedIndex] = useState<
    number | null
  >(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsLoading(true);
      axios
        .get(`https://rickandmortyapi.com/api/character/?name=${searchQuery}`)
        .then((response) => {
          const characters = response.data.results.map((character: any) => ({
            id: character.id,
            name: character.name,
            image: character.image,
            episodeCount: character.episode.length,
          }));
          setSearchResults(characters);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsError(true);
          setIsLoading(false);
        });
    }
  }, [searchQuery]);

  /**
   * Arama sorgusunu günceller ve hata durumunu sıfırlar.
   * @param {string} newQuery - Yeni arama sorgusu.
   */
  const updateSearchQuery = (newQuery: string) => {
    setSearchQuery(newQuery);
    setIsError(false);
  };

  /**
   * Karakter seçme veya seçimi kaldırma işlevini değiştirir.
   * @param {Character} character - Seçilen karakter.
   */
  const selectCharacter = (character: Character) => {
    if (isCharacterSelected(character.id)) {
      // Eğer karakter zaten seçiliyse, seçimini kaldır
      setSelectedCharacters(
        selectedCharacters.filter((c) => c.id !== character.id)
      );
    } else {
      // Eğer karakter seçili değilse, seç
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  /**
   * Belirtilen karakteri kaldırır.
   * @param {number} characterId - Kaldırılacak karakterin kimliği.
   */
  const removeCharacter = (characterId: number) => {
    setSelectedCharacters((prev) =>
      prev.filter((character) => character.id !== characterId)
    );
  };

  /**
   * Metindeki arama sorgusunu vurgular.
   * @param {string} text - Vurgulanacak metin.
   * @param {string} query - Arama sorgusu.
   * @returns {JSX.Element} - Vurgulanmış metin bileşeni.
   */
  const highlightText = (text: string, query: string): JSX.Element => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) => (
          <span
            key={index}
            style={
              part.toLowerCase() === query.toLowerCase()
                ? { fontWeight: "bold" }
                : {}
            }
          >
            {part}
          </span>
        ))}
      </span>
    );
  };

  /**
   * Klavye olaylarını işler ve belirli tuşlara yanıt verir.
   * @param {KeyboardEvent<HTMLInputElement>} event - Klavye olayı nesnesi.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      // Arama sonuçlarında gezinme
      setHighlightedIndex((prevIndex) => {
        if (event.key === "ArrowDown") {
          return (prevIndex + 1) % searchResults.length;
        } else {
          return (prevIndex - 1 + searchResults.length) % searchResults.length;
        }
      });

      // Ok tuşlarıyla gezildiğinde renk değişimi
      setHoveredIndex((prevIndex) => {
        if (event.key === "ArrowDown") {
          return prevIndex !== null
            ? (prevIndex + 1) % searchResults.length
            : 0;
        } else {
          return prevIndex !== null
            ? (prevIndex - 1 + searchResults.length) % searchResults.length
            : searchResults.length - 1;
        }
      });
    } else if (event.key === "Enter") {
      if (highlightedIndex !== null && searchResults.length > 0) {
        // Vurgulanan arama sonucunu seç
        selectCharacter(searchResults[highlightedIndex - 1]);

        // Enter tuşuna basıldığında sayfa yenileme gibi varsayılan davranışı engellemek için
        event.preventDefault();
      }
    } else if (event.key === "Backspace" || event.key === "Delete") {
      if (!searchQuery && selectedCharacters.length > 0) {
        // Son seçilen karakteri kaldır
        setSelectedCharacters(selectedCharacters.slice(0, -1));
      }
    } else if (event.key === "Tab") {
      // Gerekirse odakı bir sonraki öğeye taşımak için Tab tuşunu işlemek
    }
  };

  /**
   * Fare karakterin üzerine geldiğinde hoveredIndex'i günceller.
   * @param {number} index - Fare tarafından üzerine gelinen karakterin dizini.
   */
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  /**
   * Fare karakterin üzerinden çıkınca hoveredIndex'i sıfırlar.
   */
  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  /**
   * Bir karakterin seçilip seçilmediğini kontrol eder.
   * @param {number} id - Kontrol edilecek karakterin kimliği.
   * @returns {boolean} - Karakter seçiliyse true, değilse false.
   */
  const isCharacterSelected = (id: number) => {
    return selectedCharacters.some((character) => character.id === id);
  };

  return (
    <div className="autocomplete-wrapper">
      <div className="input-container">
        {selectedCharacters.map((character) => (
          <div
            key={character.id}
            className="selected-tag"
            onClick={() => removeCharacter(character.id)}
          >
            {character.name} <span className="remove-tag">x</span>
          </div>
        ))}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="autocomplete-input"
        />
      </div>
      {isLoading && <div className="loading">Loading...</div>}
      {isError && <div className="error">Error fetching characters</div>}
      <div className="autocomplete-results">
        {searchResults.map((character, index) => (
          <div
            key={character.id}
            className={`result-item ${
              index === hoveredIndex ? "hovered" : ""
            } ${index === focusedSelectedIndex ? "focused" : ""}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => selectCharacter(character)}
          >
            <input
              type="checkbox"
              checked={isCharacterSelected(character.id)}
              onChange={() => selectCharacter(character)}
              className="character-checkbox"
            />
            <img src={character.image} alt={character.name} />
            <div className="character-info">
              <div className="character-name">
                {highlightText(character.name, searchQuery)}
              </div>
              <div className="character-episodes">
                {character.episodeCount} Episodes
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectAutocomplete;
