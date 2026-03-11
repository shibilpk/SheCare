import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import { BlogPost } from '../../types/blog';
import { useBlogListPaginated } from '../../hooks/useBlog';
import InfiniteScrollList from '../../components/common/InfiniteScrollList';

type BlogListNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BlogList'
>;

const BlogListScreen: React.FC = () => {
  const navigation = useNavigation<BlogListNavigationProp>();
  const { fetchBlogPage } = useBlogListPaginated();

  // Helper function to format date
  const formatBlogDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleBlogPress = (blog: BlogPost) => {
    navigation.navigate(SCREENS.BLOG_DETAIL, { blogId: blog.id } as any);
  };

  const renderBlogItem = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => handleBlogPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.blogImagePlaceholder}>
        <FontelloIcon
          name="doc-text"
          size={24}
          color={THEME_COLORS.primary}
        />
      </View>
      <View style={styles.blogContent}>
        <View style={styles.blogHeader}>
          <View style={styles.categoryBadgeSmall}>
            <Text style={styles.categoryTextSmall}>Article</Text>
          </View>
          <Text style={styles.readTime}>{item.author}</Text>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.blogExcerpt} numberOfLines={2}>
          {item.short_description || 'Read more...'}
        </Text>
        <View style={styles.blogFooter}>
          <Text style={styles.blogDate}>
            {formatBlogDate(item.published_date)}
          </Text>
          <FontelloIcon
            name="right-open-mini"
            size={16}
            color={THEME_COLORS.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontelloIcon name="doc-text" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No articles available yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Blog</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content with Infinite Scroll */}
      <InfiniteScrollList<BlogPost>
        fetchData={fetchBlogPage}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },
  backBtn: {
    padding: 4,
  },
    headerTitle: {
    ...STYLE.headerTitle,
  },
  headerPlaceholder: {
    width: 36,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  blogCard: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  blogImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    flex: 1,
    padding: 12,
  },
  blogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryBadgeSmall: {
    backgroundColor: THEME_COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  readTime: {
    fontSize: 11,
    color: '#999',
  },
  blogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  blogExcerpt: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  blogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blogDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default BlogListScreen;
