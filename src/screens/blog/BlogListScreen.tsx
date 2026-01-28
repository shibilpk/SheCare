import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { STYLE } from '../../constants/app';

type BlogListNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BlogList'
>;
const FILTER_CATEGORIES = [
  'All',
  'Cardio',
  'Strength',
  'Flexibility',
  'Sports',
] as const;

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  image: any;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Understanding Your Menstrual Cycle',
    excerpt:
      'Learn about the four phases of your cycle and what happens in each stage.',
    content: `Understanding your menstrual cycle is key to better health management. The menstrual cycle has four main phases:

1. Menstrual Phase (Days 1-5): This is when bleeding occurs. Hormone levels are at their lowest, and you might feel tired.

2. Follicular Phase (Days 1-13): Overlaps with menstruation. Your body prepares to release an egg. Energy levels start to rise.

3. Ovulation Phase (Day 14): The egg is released. This is your most fertile time. You might feel more energetic and social.

4. Luteal Phase (Days 15-28): After ovulation, progesterone rises. You might experience PMS symptoms like bloating, mood changes, or breast tenderness.

Tips for each phase:
- Menstrual: Rest, gentle exercise, iron-rich foods
- Follicular: High-intensity workouts, new projects
- Ovulation: Social activities, important meetings
- Luteal: Self-care, reduce caffeine, magnesium-rich foods

Track your cycle to understand your body better and optimize your activities around your natural rhythm.`,
    category: 'Education',
    readTime: '5 min read',
    date: 'Jan 10, 2026',
    image: require('../../assets/images/cat.png'),
    author: 'Dr. Sarah Johnson',
  },
  {
    id: 2,
    title: 'Nutrition Tips for Better Periods',
    excerpt:
      'What to eat and avoid during your menstrual cycle for optimal health.',
    content: `The right nutrition can significantly improve your period experience. Here's what to focus on:

Foods to Include:
- Iron-rich foods: Spinach, lentils, red meat, fortified cereals
- Magnesium: Dark chocolate, nuts, seeds, avocado
- Omega-3s: Salmon, walnuts, flaxseeds
- Calcium: Dairy, leafy greens, fortified plant milk
- Vitamin B6: Bananas, chickpeas, potatoes
- Complex carbs: Whole grains, sweet potatoes

Foods to Limit:
- Excessive caffeine (can worsen cramps)
- High sodium foods (increases bloating)
- Processed sugars (causes energy crashes)
- Alcohol (can worsen symptoms)
- Fried and fatty foods (increases inflammation)

Phase-Specific Nutrition:
- Menstrual Phase: Focus on iron and vitamin C for absorption
- Follicular Phase: Lighter foods, fresh vegetables
- Ovulation: Antioxidant-rich foods, fiber
- Luteal Phase: Complex carbs, magnesium, calcium

Stay hydrated throughout your cycle. Drink at least 8 glasses of water daily, more during menstruation.`,
    category: 'Nutrition',
    readTime: '4 min read',
    date: 'Jan 8, 2026',
    image: require('../../assets/images/cat.png'),
    author: 'Emma Wilson, RD',
  },
  {
    id: 3,
    title: 'Managing Period Pain Naturally',
    excerpt:
      'Natural remedies and techniques to reduce menstrual cramps and discomfort.',
    content: `Period pain affects many women, but natural remedies can help manage it effectively:

Heat Therapy:
- Apply heating pad to lower abdomen for 15-20 minutes
- Take warm baths with Epsom salts
- Use heat patches designed for menstrual pain

Exercise:
- Gentle yoga (child's pose, cat-cow, pigeon pose)
- Walking or light cardio
- Stretching exercises
- Pelvic tilts

Herbal Remedies:
- Ginger tea (anti-inflammatory)
- Chamomile tea (relaxing)
- Cinnamon (reduces bleeding and pain)
- Fennel seeds (antispasmodic)

Massage:
- Gentle circular massage on lower abdomen
- Pressure points on feet and hands
- Essential oils like lavender or clary sage

Lifestyle Changes:
- Reduce stress through meditation
- Get adequate sleep (7-8 hours)
- Avoid smoking and excessive alcohol
- Stay hydrated

Supplements:
- Magnesium (400mg daily)
- Omega-3 fatty acids
- Vitamin E
- Vitamin B1

When to See a Doctor:
- Severe pain that interferes with daily life
- Pain that lasts longer than usual
- Heavy bleeding requiring frequent pad changes
- New or unusual symptoms`,
    category: 'Wellness',
    readTime: '6 min read',
    date: 'Jan 5, 2026',
    image: require('../../assets/images/cat.png'),
    author: 'Dr. Maya Patel',
  },
  {
    id: 4,
    title: 'Exercise During Your Cycle',
    excerpt: 'Best workouts for each phase of your menstrual cycle.',
    content: `Sync your workouts with your cycle for optimal results and comfort:

Menstrual Phase (Days 1-5):
- Focus: Rest and gentle movement
- Best exercises: Walking, gentle yoga, stretching
- Avoid: High-intensity workouts
- Why: Low energy and hormone levels

Follicular Phase (Days 6-13):
- Focus: Build strength and endurance
- Best exercises: HIIT, weight training, running
- Energy levels: High
- Why: Rising estrogen boosts energy

Ovulation Phase (Day 14):
- Focus: Peak performance
- Best exercises: Challenging workouts, new personal records
- Energy levels: Highest
- Why: Peak hormone levels

Luteal Phase (Days 15-28):
- Early: Continue moderate-high intensity
- Late: Shift to lower intensity
- Best exercises: Pilates, swimming, moderate cardio
- Why: Progesterone rises, energy decreases

General Tips:
- Listen to your body always
- Stay hydrated, especially during menstruation
- Adjust intensity based on how you feel
- Don't skip exercise entirely unless needed
- Use exercise to reduce cramps and improve mood

Benefits of Cycle-Synced Exercise:
- Better performance and results
- Reduced injury risk
- Improved mood
- Better hormonal balance
- Less fatigue`,
    category: 'Fitness',
    readTime: '5 min read',
    date: 'Jan 3, 2026',
    image: require('../../assets/images/cat.png'),
    author: 'Coach Lisa Martinez',
  },
  {
    id: 5,
    title: 'Mental Health and Your Cycle',
    excerpt:
      'Understanding the connection between hormones and mood throughout your cycle.',
    content: `Your menstrual cycle significantly affects your mental and emotional wellbeing:

Hormones and Mood:
- Estrogen: Increases serotonin (happy hormone)
- Progesterone: Can have calming or irritating effects
- Both fluctuate throughout your cycle

Phase-by-Phase Mental Health:

Menstrual Phase:
- Mood: Can be low or neutral
- Tips: Extra self-care, rest, gentle activities
- Common feelings: Fatigue, relief bleeding started

Follicular Phase:
- Mood: Improving, optimistic
- Tips: Start new projects, socialize
- Common feelings: Energetic, confident, creative

Ovulation Phase:
- Mood: Peak happiness and confidence
- Tips: Important conversations, networking
- Common feelings: Outgoing, attractive, communicative

Luteal Phase:
- Mood: Gradually declining, PMS possible
- Tips: Stress reduction, say no to overcommitment
- Common feelings: Anxious, irritable, sensitive

Managing PMS and PMDD:
- Track symptoms to identify patterns
- Regular exercise releases endorphins
- Adequate sleep is crucial
- Reduce caffeine and alcohol
- Practice mindfulness and meditation
- Consider therapy or counseling
- Supplements: B6, magnesium, evening primrose oil

When to Seek Help:
- Severe mood changes affecting daily life
- Thoughts of self-harm
- Inability to function during certain phases
- PMDD symptoms (severe PMS)

Remember: Your feelings are valid and hormone-related mood changes are normal. Be kind to yourself!`,
    category: 'Mental Health',
    readTime: '7 min read',
    date: 'Jan 1, 2026',
    image: require('../../assets/images/cat.png'),
    author: 'Dr. Rachel Green',
  },
  {
    id: 6,
    title: 'Sleep and Your Menstrual Cycle',
    excerpt: 'How your cycle affects sleep quality and tips for better rest.',
    content: `Your menstrual cycle can significantly impact your sleep patterns. Here's what you need to know:

Sleep Changes by Phase:

Menstrual Phase:
- Possible issues: Cramps disrupting sleep, heavy bleeding
- Solutions: Heat therapy, comfortable positions, extra pillows

Follicular Phase:
- Sleep quality: Generally better
- Tips: Establish good sleep routine now

Ovulation Phase:
- Sleep quality: Usually best
- Energy: May need less sleep

Luteal Phase:
- Possible issues: Insomnia, restless sleep, vivid dreams
- Why: Rising progesterone increases body temperature
- Common: Waking up during night

Tips for Better Sleep:

General:
- Maintain consistent sleep schedule
- Keep bedroom cool (60-67°F)
- Dark, quiet environment
- Limit screen time before bed

During Menstruation:
- Sleep on left side to reduce cramping
- Use heating pad before bed
- Take pain relief if needed
- Extra absorbent protection

During Luteal Phase:
- Reduce caffeine especially afternoon/evening
- Light dinner, avoid heavy meals
- Relaxing bedtime routine
- Consider magnesium supplement
- Practice deep breathing
- Keep room extra cool

Natural Sleep Aids:
- Chamomile tea
- Lavender essential oil
- Magnesium supplements
- Melatonin (consult doctor)

Track Your Patterns:
Use your period tracking app to note sleep quality and identify patterns throughout your cycle.

When to See a Doctor:
- Chronic insomnia
- Sleep affecting daily function
- Suspected sleep disorders`,
    category: 'Sleep',
    readTime: '5 min read',
    date: 'Dec 28, 2025',
    image: require('../../assets/images/cat.png'),
    author: 'Dr. Amy Chen',
  },
];

const BlogListScreen: React.FC = () => {
  const navigation = useNavigation<BlogListNavigationProp>();
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof FILTER_CATEGORIES)[number]>('All');
  const handleBlogPress = (blog: BlogPost) => {
    navigation.navigate(SCREENS.BLOG_DETAIL, { blog } as any);
  };

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
        <Text style={styles.headerTitle}>Health Blog</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Post */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => handleBlogPress(blogPosts[0])}
          activeOpacity={0.8}
        >
          <Image source={blogPosts[0].image} style={styles.featuredImage} />
          <View style={styles.featuredContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{blogPosts[0].category}</Text>
            </View>
            <Text style={styles.featuredTitle}>{blogPosts[0].title}</Text>
            <Text style={styles.featuredExcerpt}>{blogPosts[0].excerpt}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{blogPosts[0].readTime}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{blogPosts[0].date}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedFilter(category)}
              style={[
                styles.filterBtn,
                selectedFilter === category && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === category && styles.filterTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Blog List */}
        <View style={styles.listSection}>
          {/* <Text style={styles.sectionTitle}>Articles</Text> */}
          {blogPosts.slice(1).map(blog => (
            <TouchableOpacity
              key={blog.id}
              style={styles.blogCard}
              onPress={() => handleBlogPress(blog)}
              activeOpacity={0.7}
            >
              <Image source={blog.image} style={styles.blogImage} />
              <View style={styles.blogContent}>
                <View style={styles.blogHeader}>
                  <View style={styles.categoryBadgeSmall}>
                    <Text style={styles.categoryTextSmall}>
                      {blog.category}
                    </Text>
                  </View>
                  <Text style={styles.readTime}>{blog.readTime}</Text>
                </View>
                <Text style={styles.blogTitle} numberOfLines={2}>
                  {blog.title}
                </Text>
                <Text style={styles.blogExcerpt} numberOfLines={2}>
                  {blog.excerpt}
                </Text>
                <View style={styles.blogFooter}>
                  <Text style={styles.blogDate}>{blog.date}</Text>
                  <FontelloIcon
                    name="right-open-mini"
                    size={16}
                    color={THEME_COLORS.primary}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  featuredCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 24,
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  featuredContent: {
    padding: 16,
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
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
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
    marginHorizontal: 8,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 16,
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
  blogImage: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E7EB',
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
  bottomPadding: {
    height: 40,
  },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: THEME_COLORS.textLight,
  },
  filterBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  filterText: { fontSize: 14, fontWeight: '600', color: '#666' },
  filterTextActive: { color: THEME_COLORS.textLight },
});

export default BlogListScreen;
