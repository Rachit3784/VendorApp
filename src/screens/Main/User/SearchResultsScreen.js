import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../../theme/useTheme';
import api from '../../../services/api';
import VendorCard from '../../../components/VendorCard';

const { width } = Dimensions.get('window');

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const { colors, spacing, radius } = useTheme();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    fetchResults(1);
  }, [query]);

  const fetchResults = async (pageNum, isMore = false) => {
    try {
      if (isMore) setIsFetchingMore(true);
      else setLoading(true);

      const res = await api.get(`/vendors?search=${query}&page=${pageNum}&limit=10`);
      const newVendors = res.data.vendors;
      
      if (isMore) {
        setResults([...results, ...newVendors]);
      } else {
        setResults(newVendors);
      }
      
      setHasMore(newVendors.length === 10);
      setPage(pageNum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore) {
      fetchResults(page + 1, true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.queryText, { color: colors.primary }]}>"{query.toUpperCase()}"</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>SOURCING PROFESSIONALS...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item._id}
          renderItem={({ item, index }) => (
            <VendorCard 
              vendor={item} 
              index={index} 
              onPress={() => navigation.navigate('VendorDetail', { id: item._id })} 
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 100 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            isFetchingMore ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : null
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>NO RESULTS FOUND</Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                We couldn't find any professionals matching your search. Try different keywords or check back later.
              </Text>
              <TouchableOpacity 
                style={[styles.retryBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.retryText, { color: colors.primaryText }]}>MODIFY SEARCH</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 8 },
  queryText: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 10, fontWeight: '800', marginTop: 20, letterSpacing: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: '800', marginTop: 24, letterSpacing: 1 },
  emptySubtext: { fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  retryBtn: { marginTop: 32, paddingHorizontal: 30, paddingVertical: 14 },
  retryText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
});

export default SearchResultsScreen;
