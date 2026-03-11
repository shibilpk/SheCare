import React from 'react';
import { View, Text, StyleSheet, TextStyle, Linking } from 'react-native';
import { THEME_COLORS } from '../../constants/colors';

interface EditorJsBlock {
  type: string;
  data: {
    text?: string;
    level?: number;
    style?: 'ordered' | 'unordered';
    items?: string[];
    [key: string]: any;
  };
}

interface EditorJsData {
  time?: number;
  blocks?: EditorJsBlock[];
  version?: string;
}

interface EditorJsRendererProps {
  data: EditorJsData;
  customStyles?: {
    h1?: TextStyle;
    h2?: TextStyle;
    h3?: TextStyle;
    paragraph?: TextStyle;
    listText?: TextStyle;
  };
}

// Helper to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');
};

// Get style for a specific HTML tag
const getStyleForTag = (
  tagName: string,
  attrs?: string
): { style: TextStyle; link?: string } => {
  let style: TextStyle = {};
  let link: string | undefined;

  switch (tagName) {
    case 'b':
    case 'strong':
      style = { fontWeight: '700' };
      break;
    case 'i':
    case 'em':
      style = { fontStyle: 'italic' };
      break;
    case 'mark':
      style = { backgroundColor: '#FEF08A', paddingHorizontal: 2 };
      break;
    case 'a': {
      const hrefRegex = /href=["']([^"']+)["']/;
      const hrefMatch = hrefRegex.exec(attrs || '');
      link = hrefMatch?.[1] || '';
      style = {
        color: THEME_COLORS.primary,
        textDecorationLine: 'underline',
      };
      break;
    }
  }

  return { style, link };
};

// Render a text element with combined styles and optional link
const renderTextElement = (
  text: string,
  styleStack: Array<{ tag: string; style: TextStyle; link?: string }>,
  baseStyle: TextStyle | undefined,
  key: number,
  link?: string
): React.ReactElement => {
  const combinedStyle = styleStack.reduce(
    (acc, item) => ({ ...acc, ...item.style }),
    { ...baseStyle }
  );

  if (link) {
    return (
      <Text
        key={`link-${key}`}
        style={combinedStyle}
        onPress={() => Linking.openURL(link)}
      >
        {text}
      </Text>
    );
  }

  return (
    <Text key={`text-${key}`} style={combinedStyle}>
      {text}
    </Text>
  );
};

// Parse and render formatted text with support for bold, italic, links, and highlighting
// Parse and render formatted text with support for bold, italic, links, and highlighting
const renderFormattedText = (html: string, baseStyle?: TextStyle): React.ReactNode => {
  if (!html) return '';

  const text = decodeHtmlEntities(html);
  const elements: React.ReactNode[] = [];
  let key = 0;

  const tagPattern = /<(\/?)([a-z]+)(?:\s+([^>]*?))?>/gi;
  let lastIndex = 0;
  let match;
  const styleStack: Array<{ tag: string; style: TextStyle; link?: string }> = [];

  while ((match = tagPattern.exec(text)) !== null) {
    const beforeText = text.substring(lastIndex, match.index);
    if (beforeText) {
      const currentLink = styleStack.find(s => s.link)?.link;
      elements.push(renderTextElement(beforeText, styleStack, baseStyle, key++, currentLink));
    }

    const isClosing = match[1] === '/';
    const tagName = match[2].toLowerCase();
    const attrs = match[3];

    if (tagName === 'br') {
      elements.push(<Text key={`br-${key++}`}>{'\n'}</Text>);
    } else if (isClosing) {
      const index = styleStack.findIndex(s => s.tag === tagName);
      if (index !== -1) {
        styleStack.splice(index, 1);
      }
    } else {
      const tagStyle = getStyleForTag(tagName, attrs);
      styleStack.push({ tag: tagName, ...tagStyle });
    }

    lastIndex = tagPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      const currentLink = styleStack.find(s => s.link)?.link;
      elements.push(renderTextElement(remainingText, styleStack, baseStyle, key++, currentLink));
    }
  }

  return elements.length > 0 ? elements : text;
};

// Helper function to strip HTML tags (for plain text scenarios)
const stripHtmlTags = (text: string): string => {
  if (!text) return '';

  // Replace <br> tags with newlines
  let cleaned = text.replaceAll(/<br\s*\/?>/gi, '\n');

  // Remove all other HTML tags
  cleaned = cleaned.replaceAll(/<[^>]*>/g, '');

  // Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned);

  // Remove trailing newlines
  cleaned = cleaned.replaceAll(/\n+$/g, '');

  return cleaned;
};

/**
 * EditorJsRenderer - A comprehensive React Native component for rendering EditorJS JSON content
 *
 * @example
 * ```tsx
 * const editorData = {
 *   time: 1773117216023,
 *   blocks: [
 *     { type: 'Header', data: { text: 'Welcome', level: 1 } },
 *     { type: 'paragraph', data: { text: 'This is a paragraph.' } },
 *     { type: 'List', data: {
 *       style: 'unordered',
 *       items: ['Item 1', 'Item 2']
 *     }}
 *   ],
 *   version: '2.18.0'
 * };
 *
 * <EditorJsRenderer data={editorData} />
 * ```
 *
 * Supported block types:
 * - Header (h1, h2, h3) - Headings with different levels
 * - paragraph - Regular text blocks with HTML entity support
 * - List (ordered/unordered) - Numbered or bulleted lists
 * - quote - Styled quoted text with left border
 * - code - Code blocks with monospace font
 * - delimiter - Visual separator (* * *)
 * - warning - Warning/alert boxes with icon
 * - table - Data tables with optional headers
 * - checklist - Interactive-style checkable items
 * - embed - Embedded content placeholder with source info
 * - image - Image placeholder with caption
 * - attaches/attachment - File attachment info display
 *
 * Features:
 * - Automatic HTML tag stripping and entity decoding
 * - Custom style override support
 * - Responsive and accessible
 * - Handles newlines and formatting
 */
const EditorJsRenderer: React.FC<EditorJsRendererProps> = ({
  data,
  customStyles = {},
}) => {
  if (!data?.blocks || data.blocks.length === 0) {
    return (
      <Text style={styles.errorText}>No content available</Text>
    );
  }

  const renderBlock = (block: EditorJsBlock, index: number) => {
    const blockKey = `${block.type}-${index}`;
    const blockType = block.type.toLowerCase();

    switch (blockType) {
      case 'header': {
        const getHeaderStyle = () => {
          if (block.data.level === 1) return styles.h1;
          if (block.data.level === 2) return styles.h2;
          return styles.h3;
        };

        return (
          <Text
            key={blockKey}
            style={[
              styles.header,
              getHeaderStyle(),
              customStyles[`h${block.data.level}` as keyof typeof customStyles],
            ]}
          >
            {stripHtmlTags(block.data.text || '')}
          </Text>
        );
      }

      case 'paragraph': {
        const text = block.data.text || '';
        if (!text.trim()) return null;

        return (
          <Text
            key={blockKey}
            style={[styles.paragraph, customStyles.paragraph]}
          >
            {renderFormattedText(text, styles.paragraph)}
          </Text>
        );
      }

      case 'list': {
        return (
          <View key={blockKey} style={styles.list}>
            {block.data.items?.map((item: string, itemIndex: number) => {
              if (!item.trim()) return null;

              return (
                <View
                  key={`${blockKey}-item-${itemIndex}`}
                  style={styles.listItem}
                >
                  <Text style={styles.listBullet}>
                    {block.data.style === 'ordered'
                      ? `${itemIndex + 1}.`
                      : '•'}
                  </Text>
                  <Text style={[styles.listText, customStyles.listText]}>
                    {renderFormattedText(item, styles.listText)}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      }

      case 'quote': {
        return (
          <View key={blockKey} style={styles.quoteContainer}>
            <View style={styles.quoteBorder} />
            <Text style={styles.quoteText}>
              {renderFormattedText(block.data.text || '', styles.quoteText)}
            </Text>
          </View>
        );
      }

      case 'code': {
        return (
          <View key={blockKey} style={styles.codeContainer}>
            <Text style={styles.codeText}>{block.data.text || ''}</Text>
          </View>
        );
      }

      case 'delimiter': {
        return (
          <View key={blockKey} style={styles.delimiter}>
            <Text style={styles.delimiterText}>* * *</Text>
          </View>
        );
      }

      case 'warning': {
        return (
          <View key={blockKey} style={styles.warningContainer}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningTitle}>
                {stripHtmlTags(block.data.title || 'Warning')}
              </Text>
            </View>
            <Text style={styles.warningMessage}>
              {stripHtmlTags(block.data.message || block.data.text || '')}
            </Text>
          </View>
        );
      }

      case 'table': {
        const hasHeader = block.data.withHeadings;
        const tableData = block.data.content || [];

        return (
          <View key={blockKey} style={styles.tableContainer}>
            {tableData.map((row: string[], rowIndex: number) => (
              <View
                key={`${blockKey}-row-${rowIndex}`}
                style={[
                  styles.tableRow,
                  hasHeader && rowIndex === 0 && styles.tableHeaderRow,
                ]}
              >
                {row.map((cell: string, cellIndex: number) => (
                  <Text
                    key={`${blockKey}-cell-${rowIndex}-${cellIndex}`}
                    style={[
                      styles.tableCell,
                      hasHeader && rowIndex === 0 && styles.tableHeaderCell,
                    ]}
                  >
                    {stripHtmlTags(cell)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      }

      case 'checklist': {
        return (
          <View key={blockKey} style={styles.checklistContainer}>
            {block.data.items?.map((item: any, itemIndex: number) => (
              <View
                key={`${blockKey}-check-${itemIndex}`}
                style={styles.checklistItem}
              >
                <Text style={styles.checklistIcon}>
                  {item.checked ? '☑' : '☐'}
                </Text>
                <Text
                  style={[
                    styles.checklistText,
                    item.checked && styles.checklistTextChecked,
                  ]}
                >
                  {stripHtmlTags(item.text)}
                </Text>
              </View>
            ))}
          </View>
        );
      }

      case 'embed': {
        return (
          <View key={blockKey} style={styles.embedContainer}>
            <Text style={styles.embedCaption}>
              🔗 {stripHtmlTags(block.data.caption || 'Embedded Content')}
            </Text>
            {block.data.service && (
              <Text style={styles.embedService}>
                Source: {block.data.service}
              </Text>
            )}
          </View>
        );
      }

      case 'image': {
        return (
          <View key={blockKey} style={styles.imageContainer}>
            <Text style={styles.imagePlaceholder}>🖼️ Image</Text>
            {block.data.caption && (
              <Text style={styles.imageCaption}>
                {stripHtmlTags(block.data.caption)}
              </Text>
            )}
          </View>
        );
      }

      case 'attaches':
      case 'attachment': {
        return (
          <View key={blockKey} style={styles.attachmentContainer}>
            <Text style={styles.attachmentIcon}>📎</Text>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentTitle}>
                {stripHtmlTags(block.data.title || block.data.file?.name || 'Attachment')}
              </Text>
              {block.data.file?.size && (
                <Text style={styles.attachmentSize}>
                  {(block.data.file.size / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>
          </View>
        );
      }

      default:
        // Fallback for unsupported block types
        if (block.data.text) {
          return (
            <Text key={blockKey} style={styles.paragraph}>
              {stripHtmlTags(block.data.text)}
            </Text>
          );
        }
        console.warn(`Unsupported block type: ${block.type}`);
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {data.blocks.map((block, index) => renderBlock(block, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontWeight: '600',
    marginBottom: 8,
    color: THEME_COLORS.text,
    marginTop: 6,
  },
  h1: {
    fontSize: 26,
    marginTop: 12,
    fontWeight: '700',
  },
  h2: {
    fontSize: 22,
    marginTop: 10,
    fontWeight: '700',
  },
  h3: {
    fontSize: 18,
    marginTop: 8,
    fontWeight: '600',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: THEME_COLORS.text,
    marginBottom: 10,
  },
  list: {
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 8,
  },
  listBullet: {
    fontSize: 15,
    color: THEME_COLORS.text,
    marginRight: 8,
    minWidth: 20,
    fontWeight: '600',
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    color: THEME_COLORS.text,
    flex: 1,
  },
  quoteContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
  },
  quoteBorder: {
    width: 4,
    backgroundColor: THEME_COLORS.primary,
    marginRight: 12,
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: THEME_COLORS.textGray,
    fontStyle: 'italic',
  },
  codeContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: 'Courier New',
    fontSize: 13,
    lineHeight: 18,
    color: '#263238',
  },
  delimiter: {
    alignItems: 'center',
    marginVertical: 12,
  },
  delimiterText: {
    fontSize: 18,
    color: THEME_COLORS.textGray,
    letterSpacing: 4,
  },
  errorText: {
    fontSize: 15,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 12,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  warningMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350F',
  },
  tableContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderRow: {
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    color: THEME_COLORS.text,
  },
  tableHeaderCell: {
    fontWeight: '600',
    color: '#111827',
  },
  checklistContainer: {
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  checklistIcon: {
    fontSize: 16,
    marginRight: 8,
    color: THEME_COLORS.primary,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: THEME_COLORS.text,
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
    color: THEME_COLORS.textGray,
  },
  embedContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLORS.primary,
  },
  embedCaption: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  embedService: {
    fontSize: 12,
    color: THEME_COLORS.textGray,
  },
  imageContainer: {
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 20,
    marginBottom: 6,
  },
  imageCaption: {
    fontSize: 13,
    color: THEME_COLORS.textGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  attachmentIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: THEME_COLORS.textGray,
  },
});

export default EditorJsRenderer;
