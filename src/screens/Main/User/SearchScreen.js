import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, X, History, MapPin, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../theme/useTheme';
import api from '../../../services/api';

const RECENT_SEARCHES_KEY = '@recent_searches';

const SearchScreen = ({ navigation }) => {
  const { colors, spacing, radius } = useTheme();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  // ─── Debouncing Logic ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async (term) => {
    try {
      setLoading(true);
      const res = await api.get(`/vendors?search=${term}&limit=5`);
      setSuggestions(res.data.vendors);
    } catch (e) {
      console.error('Suggestions error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load history');
    }
  };

  const saveToHistory = async (term) => {
    if (!term.trim()) return;
    const newHistory = [term, ...history.filter(item => item !== term)].slice(0, 10);
    setHistory(newHistory);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
  };

  const removeHistoryItem = async (term) => {
    const newHistory = history.filter(item => item !== term);
    setHistory(newHistory);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSearch = (term) => {
    const finalTerm = term || query;
    if (!finalTerm.trim()) return;
    saveToHistory(finalTerm);
    navigation.navigate('SearchResults', { query: finalTerm });
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity 
      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
      onPress={() => {
        saveToHistory(item.workTitle || item.vendorId?.fullname);
        navigation.navigate('VendorDetail', { id: item._id });
      }}
    >
      <Image 
        source={{ uri: item.vendorId?.profileImage || 'https://via.placeholder.com/100' }} 
        style={[styles.suggestionImg, { borderRadius: radius.sm }]} 
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.suggestionName, { color: colors.textPrimary }]}>{item.vendorId?.fullname?.toUpperCase()}</Text>
        <Text style={[styles.suggestionWork, { color: colors.primary }]}>{item.workTitle?.toUpperCase()}</Text>
      </View>
      <View style={styles.suggestionMeta}>
        <View style={styles.row}>
          <Star size={10} color={colors.star} fill={colors.star} />
          <Text style={[styles.metaText, { color: colors.textPrimary }]}>{item.avgRating.toFixed(1)}</Text>
        </View>
        <View style={[styles.row, { marginTop: 4 }]}>
          <MapPin size={10} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.vendorLocation?.city?.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* Search Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            autoFocus
            placeholder="Search professionals..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            style={[styles.input, { color: colors.textPrimary }]}
            returnKeyType="search"
          />
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          ) : query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {query.length > 1 ? (
          <View style={{ flex: 1 }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: spacing.md }]}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SUGGESTIONS</Text>
            </View>
            <FlatList
              data={suggestions}
              keyExtractor={item => item._id}
              renderItem={renderSuggestion}
              contentContainerStyle={{ paddingHorizontal: spacing.md }}
              ListEmptyComponent={() => !loading && (
                <Text style={[styles.noResultText, { color: colors.textMuted }]}>No direct matches found...</Text>
              )}
            />
          </View>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
            {history.length > 0 && (
              <View style={styles.historyHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>RECENT SEARCHES</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={[styles.clearAll, { color: colors.error }]}>CLEAR ALL</Text>
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={history}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.historyItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSearch(item)}
                >
                  <History size={16} color={colors.textMuted} />
                  <Text style={[styles.historyText, { color: colors.textSecondary }]}>{item}</Text>
                  <TouchableOpacity onPress={() => removeHistoryItem(item)} style={styles.removeItem}>
                    <X size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    height: 50,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, padding: 0 },
  clearBtn: { padding: 4 },
  sectionHeader: { marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 20 },
  clearAll: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  historyText: { flex: 1, marginLeft: 12, fontSize: 15 },
  removeItem: { padding: 8 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  suggestionImg: { width: 44, height: 44 },
  suggestionName: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  suggestionWork: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  suggestionMeta: { alignItems: 'flex-end' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 10, fontWeight: '700' },
  noResultText: { marginTop: 20, textAlign: 'center', fontSize: 12, fontStyle: 'italic' },
});

export default SearchScreen;
