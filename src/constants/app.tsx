const spacing = {
  mh: 10,
  ph: 10,
  mv: 10,
  scPb: 40
};

export const STYLE = {
  spacing,
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#333',
  },
  headerIcon: {
    color: '#333',
    size: 26,
  },
  scrollContent: {
    paddingHorizontal: spacing.ph,
    paddingBottom: spacing.scPb,
  },
};