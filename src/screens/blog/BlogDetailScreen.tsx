import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import { BlogPost } from './BlogListScreen';

type BlogDetailRouteProp = RouteProp<RootStackParamList, 'BlogDetail'>;
type BlogDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BlogDetail'
>;

const BlogDetailScreen: React.FC = () => {
  const navigation = useNavigation<BlogDetailNavigationProp>();
  const route = useRoute<BlogDetailRouteProp>();
  const blog = (route.params as any)?.blog as BlogPost;

  if (!blog) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Blog not found</Text>
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
          {blog.category}
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
        {/* Hero Image */}
        <Image source={blog.image} style={styles.heroImage} />

        {/* Article Info */}
        <View style={styles.articleInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{blog.category}</Text>
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
              <Text style={styles.metaText}>{blog.date}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{blog.readTime}</Text>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.contentSection}>
          <Text style={styles.excerpt}>{blog.excerpt}</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>{blog.content}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{blog.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Health</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Wellness</Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E7EB',
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
  metaDot: {
    fontSize: 13,
    color: '#999',
    marginHorizontal: 6,
  },
  contentSection: {
    backgroundColor: THEME_COLORS.textLight,
    marginTop: 12,
    padding: 20,
  },
  excerpt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  content: {
    fontSize: 15,
    color: THEME_COLORS.text,
    lineHeight: 26,
  },
  tagsSection: {
    backgroundColor: THEME_COLORS.textLight,
    marginTop: 12,
    padding: 20,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
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
