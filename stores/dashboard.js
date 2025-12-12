import { reactive } from 'vue'
const POINT_TYPE = {
  TOTAL_POINT: 'total_point',
  POINT_COUNT: 'point_count',
}
export const store = reactive({
  async fetchingDashboardData() {
    try {
      const settings = useState('settings')
      const { data } = await useFetchApi('GET', 'dashboard')

      const sumTotal = Object.values(data).reduce(
        (acc, cur) => acc + cur.totalVoucher,
        0
      )
      const pointType = settings.value?.user_dashboard?.footers?.point_type
      let footer_point = 0
      if (pointType === POINT_TYPE.TOTAL_POINT) {
        footer_point = data.point ?? 0
      } else if (pointType === POINT_TYPE.POINT_COUNT) {
        footer_point = data.point_count ?? 0
      }
      this.footer_point = String(footer_point).padStart(4, '0')
      this.point = String(data.point).padStart(4, '0')
    } catch (error) {
      console.log("Error: Can't save spin result")
    }
  },
})
