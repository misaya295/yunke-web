<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input
        v-model="queryParams.assetsName"
        placeholder="学校资产ID"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.repairPrice"
        placeholder="维修价格"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.repairProverUserInfoUuid"
        placeholder="维修证明人ID"
        class="filter-item search-item"
      />
      <el-button
        v-hasPermission="['repair:get']"
        type="primary"
        class="filter-item"
        plain
        @click="searchrepair"
      >搜索</el-button>
      <el-button type="warning" class="filter-item" plain @click="resetrepair">重置</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="repairList" border fit style="width: 100%;">
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="学校资产ID"
          prop="assetsName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="维修价格"
          prop="repairPrice"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        />
        <el-table-column
          label="维修日期"
          prop="repairDate"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="维修证明人ID"
          prop="repairProverUserInfoUuid"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="操作"
          align="center"
          min-width="80px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              v-hasPermission="['repair:delete']"
              class="item"
              effect="dark"
              content="完成维修"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-check table-operation"
                style="color: #87d068;"
                @click="changeReimbursement(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['repair:put']"
              class="item"
              effect="dark"
              content="修改维修数据"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-setting table-operation"
                style="color: #2db7f5;"
                @click="showEditDialog(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['repair:get']"
              class="item"
              effect="dark"
              content="查看详细信息"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-info table-operation"
                style="color: #909399;"
                @click="toogleExpand(slope.row)"
              />
            </el-tooltip>
            <el-link
              v-has-no-permission="['repair:put','repair:delete','repair:get']"
              class="no-perm"
            >{{ $t('tips.noPermission') }}</el-link>
          </template>
        </el-table-column>
        <el-table-column type="expand" width="1">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-form-item label="维修信息ID:">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="发票:">
                <ul class="invoiceUl">
                  <li
                    v-for="(item, i) in (props.row.repairInvoice || '').split(',')"
                    :key="i"
                    class="invoiceLi"
                    @click="showpreViewDialog(item)"
                  >{{ item }}</li>
                </ul>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pagination.num"
        :limit.sync="pagination.size"
        @pagination="search"
      />

      <!-- 修改对话框 -->
      <el-dialog
        title="修改维修信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeEditDialog"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
          <el-form-item label="学校资产ID" prop="assetsName">
            <el-input v-model="editForm.assetsName" disabled />
          </el-form-item>
          <el-form-item label="维修证明人ID" prop="repairProverUserInfoUuid">
            <el-input v-model="editForm.repairProverUserInfoUuid" disabled />
          </el-form-item>
          <el-form-item label="维修价格" prop="repairPrice" type="number">
            <el-input v-model.number="editForm.repairPrice" />
          </el-form-item>
          <el-form-item label="维修日期" prop="repairDate">
            <el-date-picker
              v-model="editForm.repairDate"
              type="date"
              placeholder="选择日期"
              align="right"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="发票" prop="repairInvoice">
            <el-upload
              :before-upload="handleBeforeUpload"
              :before-remove="handleBeforeRemove"
              :on-success="editHandleSuccess"
              :file-list="editFileList"
              :action="uploadUrl"
              class="upload-demo"
              :headers="headers"
              multiple
              :limit="3"
              :on-preview="handlePreview"
              list-type="picture-card"
              :disabled="fileUrlList.length===3?true:false"
            >
              <i v-if="fileUrlList.length<3" class="el-icon-plus" />
              <i v-else class="el-icon-close" />
              <div
                slot="tip"
                style="display: block;"
                class="el-upload__tip"
              >请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
            </el-upload>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRepair">修 改</el-button>
        </span>
      </el-dialog>

      <!-- 图片预览 -->
      <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="40%"
        @close="previewDialogClose"
      >
        <el-image :src="previewPath" alt class="previewImg" />
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { qiNiuUrl } from '@/settings'
import { getToken } from '@/utils/auth'
import { validateFileExt } from '@/utils/my-validate'
import Pagination from '@/components/Pagination'
export default {
  name: 'Index',
  components: { Pagination },
  data() {
    return {
      // 输入框的值
      input: '',
      // 存放查询数据
      repairList: null,
      // 存放查询数目
      total: 0,
      list: null,
      queryParams: {},
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      },
      // 添加对话框的显示与隐藏
      drawerVisible: false,
      addDialogVisible: false,
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 绑定修改对话框中的表单数据
      editForm: {
        assetsName: '',
        repairPrice: '',
        repairDate: '',
        repairInvoice: '',
        repairProverUserInfoUuid: '',
        id: 0
      },
      // 修改对话框的验证规则
      editFormRules: {
        repairPrice: [
          {
            validator(rule, value, callback) {
              if (value === '') {
                callback()
              }
              if (Number.isInteger(Number(value)) && Number(value) > 0) {
                callback()
              } else {
                callback(new Error('请输入有效数字'))
              }
            },
            trigger: 'blur'
          }
        ]
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      // 图片上传组件的headers请求头对象
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      // 上传图片的URL地址
      uploadUrl: qiNiuUrl,
      fileList: [],
      files: [],
      // 保存图片地址
      fileUrlList: [],
      editFileList: []
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    // 根据条件获取所有考证信息
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0]
        params.createTimeTo = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/school/assets/repair', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.repairList = data.rows
        console.log(data)
        this.loading = false
      })
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },

    // 搜索证书
    searchrepair() {
      console.log(this.queryParams)
      this.$get(`studio/school/assets/repair`, { ...this.queryParams }).then(
        (r) => {
          const data = r.data.data
          this.repairList = data.rows
          this.total = data.total
          console.log(r)
        }
      )
    },
    // 重置搜索框数据
    resetrepair() {
      this.queryParams = {}
      this.fetch()
    },
    // 获取时间
    getTime: function() {
      var _this = this
      const yy = new Date().getFullYear()
      const mm =
        new Date().getMonth() + 1 < 10
          ? '0' + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1
      const dd =
        new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate()
      _this.nowDate = yy + ':' + mm + ':' + dd
      return _this.nowDate
    },
    // 弹出完成维修对话框
    async changeReimbursement(row) {
      console.log(row)
      // 检查维修日期，价格是否填写
      if (row.repairDate === '' || row.repairDate === null) {
        return this.$message.info('请填写维修日期后再点击该按钮！')
      }
      if (row.repairPrice === '' || row.repairPrice === null) {
        return this.$message.info('请填写维修价格后再点击该按钮！')
      }

      // 符合条件，弹出完成维修对话框
      // this.reimbursementDialogVisible = true
      const confirmResult = await this.$confirm(
        '是否确认完成维修?该维修信息将被删除',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了该操作')
      }

      this.$delete(`studio/school/assets/repair/${row.id}`, {
        ...this.Funding
      }).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('完成维修!')
        } else {
          this.$message.error('提交失败！')
        }
        this.fetch()
      })
    },
    // 修改证书对话框
    showEditDialog(row) {
      // 获得数据
      // 浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row)
      console.log(this.editForm.repairInvoice)
      console.log(typeof this.editForm.repairInvoice)
      if (
        this.editForm.repairInvoice === null ||
        this.editForm.repairInvoice === ''
      ) {
        this.fileUrlList = []
      } else {
        this.fileUrlList = this.editForm.repairInvoice.split(',')
      }
      console.log(this.fileUrlList)
      console.log(typeof this.fileUrlList)
      if (this.fileUrlList !== null) {
        for (var i = 0; i < this.fileUrlList.length; i++) {
          var fileurl = this.fileUrlList[i]
          if (fileurl !== null || fileurl !== '') {
            this.editFileList.push({
              name: fileurl.substring(28),
              url: fileurl
            })
          }
        }
      }
      this.editDialogVisible = true
    },
    // 提交修改对话框
    editRepair() {
      console.log(this.editForm)
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return
        this.$put('studio/school/assets/repair', { ...this.editForm }).then(
          (r) => {
            if (r.status === 200) {
              this.$message.success('修改成功！')
              this.editDialogVisible = false
            } else {
              this.$message.error('修改失败！')
            }
            this.fetch()
          }
        )
      })
    },
    // 监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
      this.fileUrlList = []
      this.editFileList = []
    },
    // 修改用户的发票上传成功后
    editHandleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (
        this.editForm.repairInvoice === '' ||
        this.editForm.repairInvoice === null
      ) {
        this.editForm.repairInvoice = response.data.url
      } else {
        this.editForm.repairInvoice =
          this.editForm.repairInvoice + ',' + response.data.url
      }
    },
    // 删除上传的图片
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          this.$delete(`oss/content/${this.files[i].id}`).then(() => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
          return true
        }
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 上传校验
    handleBeforeUpload(file) {
      if (file.size / 1024 > 5000) {
        this.$message({
          message: '上传文件大小不能超过5MB!',
          type: 'error'
        })
        return false
      } else {
        const ext = file.name.replace(/.+\./, '')
        if (!validateFileExt(ext)) {
          this.$message({
            type: 'error',
            message: '禁止上传' + ext + '类型的附件'
          })
          return false
        }
      }
    },
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = ''
      this.previewVisible = false
    },
    // 手风琴效果
    toogleExpand(row) {
      const $table = this.$refs.tableref
      this.repairList.map((item) => {
        if (row.id !== item.id) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    }
  }
}
</script>

<style scoped>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.invoiceUl {
  list-style: none;
  margin: 0;
}
.invoiceUl .invoiceLi {
  cursor: pointer;
}
</style>
