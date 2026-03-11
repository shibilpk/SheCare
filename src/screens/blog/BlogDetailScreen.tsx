import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import { useBlogDetail } from '../../hooks/useBlog';
import { EditorJsRenderer } from '../../components';

type BlogDetailRouteProp = RouteProp<RootStackParamList, 'BlogDetail'>;
type BlogDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BlogDetail'
>;

const BlogDetailScreen: React.FC = () => {
  const navigation = useNavigation<BlogDetailNavigationProp>();
  const route = useRoute<BlogDetailRouteProp>();
  const blogId = (route.params as any)?.blogId;
  const { blog, isLoading, error } = useBlogDetail(blogId);

  // Helper function to format date
  const formatBlogDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <FontelloIcon name="left-open-mini" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !blog) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <FontelloIcon name="left-open-mini" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <FontelloIcon name="attention" size={64} color="#ccc" />
          <Text style={styles.errorText}>
            {error || 'Article not found'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <FontelloIcon name="left-open-mini" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Article
        </Text>
        <TouchableOpacity style={styles.shareBtn}>
          <FontelloIcon name="share" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Placeholder */}
        <View style={styles.heroImagePlaceholder}>
          <FontelloIcon name="doc-text" size={64} color={THEME_COLORS.primary} />
        </View>

        {/* Article Info */}
        <View style={styles.articleInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>Article</Text>
          </View>
          <Text style={styles.title}>{blog.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <FontelloIcon name="user" size={16} color={THEME_COLORS.primary} />
              </View>
              <Text style={styles.authorName}>{blog.author}</Text>
            </View>
            <View style={styles.metaDetails}>
              <Text style={styles.metaText}>
                {formatBlogDate(blog.published_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Article Content - Use EditorJsRenderer */}
        <View style={styles.contentSection}>
          <EditorJsRenderer data={blog.content} />
        </View>

        {/* Share Section */}
        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Share this article</Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareButton}>
              <FontelloIcon name="share" size={20} color={THEME_COLORS.primary} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <FontelloIcon name="heart-empty" size={20} color={THEME_COLORS.primary} />
              <Text style={styles.shareButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  shareBtn: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: THEME_COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleInfo: {
    padding: 20,
    backgroundColor: THEME_COLORS.textLight,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME_COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.text,
    lineHeight: 32,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  metaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#999',
  },
  contentSection: {
    backgroundColor: THEME_COLORS.textLight,
    marginTop: 12,
    padding: 20,
  },
  shareSection: {
    backgroundColor: THEME_COLORS.textLight,
    marginTop: 12,
    padding: 20,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary + '10',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  bottomPadding: {
    height: 40,
  },
});

export default BlogDetailScreen;
