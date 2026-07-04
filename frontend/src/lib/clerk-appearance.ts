export const clerkAppearance = {
  variables: {
    colorPrimary: '#3370FF',
    colorText: '#1F2329',
    colorTextSecondary: '#646A73',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#1F2329',
    borderRadius: '8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-sm border border-[#E5E6EB] rounded-lg',
    headerTitle: 'text-[#1F2329] font-semibold',
    headerSubtitle: 'text-[#646A73]',
    formButtonPrimary:
      'bg-[#3370FF] hover:bg-[#2860E1] text-white rounded-md shadow-none normal-case',
    footerActionLink: 'text-[#3370FF] hover:text-[#2860E1]',
    formFieldInput:
      'border-[#E5E6EB] rounded-md focus:ring-2 focus:ring-[#E8F0FF] focus:border-[#3370FF]',
  },
}
