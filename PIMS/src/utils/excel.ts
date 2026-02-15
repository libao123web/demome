import * as XLSX from 'xlsx'
import type { Personnel } from '@/types'

/**
 * 从 Excel 文件导入数据
 */
export function importFromExcel<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsBinaryString(file)
  })
}

/**
 * 导出数据到 Excel 文件
 */
export function exportToExcel<T extends object>(
  data: T[],
  filename: string,
  sheetName = 'Sheet1'
): void {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * 下载导入模板
 */
export function downloadTemplate<T extends object>(
  templateData: T[],
  filename: string
): void {
  exportToExcel(templateData, filename)
}

/**
 * 人员数据字段映射（中文 -> 英文）
 */
export const personnelFieldMap: Record<string, keyof Personnel> = {
  '姓名': 'name',
  '身份证号': 'idCard',
  '手机号': 'phone',
  '性别': 'gender',
  '出生日期': 'birthDate',
  '民族': 'ethnicity',
  '籍贯': 'nativePlace',
  '政治面貌': 'politicalStatus',
  '学历': 'education',
  '现住址': 'address',
  '工作单位': 'workplace',
  '备注': 'remark'
}

/**
 * 转换导入的人员数据
 */
export function transformImportData(rawData: Record<string, any>[]): Partial<Personnel>[] {
  return rawData.map(row => {
    const transformed: Record<string, any> = {}
    
    Object.keys(row).forEach(key => {
      const fieldName = personnelFieldMap[key]
      if (fieldName) {
        let value = row[key]
        // 处理性别字段
        if (fieldName === 'gender') {
          value = value === '男' ? 'male' : 'female'
        }
        transformed[fieldName] = value
      }
    })
    
    return transformed as Partial<Personnel>
  })
}

/**
 * 获取人员导入模板数据（包含示例和格式说明）
 */
export function getPersonnelImportTemplate(): Record<string, any>[] {
  return [
    {
      '姓名': '张三',
      '身份证号': '110101199001011234',
      '性别': '男',
      '手机号': '13800138001',
      '出生日期': '1990-01-01',
      '民族': '汉族',
      '籍贯': '北京市',
      '政治面貌': '群众',
      '学历': '本科',
      '现住址': '北京市朝阳区XX路XX号',
      '备注': '示例数据1'
    },
    {
      '姓名': '李四',
      '身份证号': '110101199202022345',
      '性别': '女',
      '手机号': '13900139002',
      '出生日期': '1992-02-02',
      '民族': '汉族',
      '籍贯': '上海市',
      '政治面貌': '党员',
      '学历': '硕士',
      '现住址': '上海市浦东新区XX路XX号',
      '备注': '示例数据2'
    },
    {
      '姓名': '王五',
      '身份证号': '110101199503033456',
      '性别': '男',
      '手机号': '13700137003',
      '出生日期': '1995-03-03',
      '民族': '回族',
      '籍贯': '广东省广州市',
      '政治面貌': '团员',
      '学历': '大专',
      '现住址': '广州市天河区XX路XX号',
      '备注': '示例数据3'
    }
  ]
}
