<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input
        v-model="queryParams.propertyName"
        placeholder="资产名称"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.repairPrice"
        placeholder="维修价格"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.repairProverUserInfoName"
        placeholder="维修证明人"
        class="filter-item search-item"
      />
      <el-button
        v-hasPermission="['repair:get']"
        type="primary"
        class="filter-item"
        plain
        @click="searchrepair"
      >搜索</el-button>
      <el-button
        type="warning"
        class="filter-item"
        plain
        @click="resetrepair"
      >重置</el-button>
      <!-- table内容 -->
      <el-table
        ref="tableref"
        :data="repairList"
        border
        fit
        style="width: 100%;"
        @row-click="toogleExpand"
      >
        <el-table-column
          type="selection"
          align="center"
          width="40px"
        />
        <el-table-column
          label="资产名称"
          prop="propertyName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="维修信息"
          prop="repairMessage"
          :show-overflow-tooltip="true"
          align="center"
          min-width="100px"
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
          min-width="70px"
        />
        <el-table-column
          label="状态"
          prop="state"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.state === 0"
              type="info"
            >拒绝维修</el-tag>
            <el-tag
              v-else-if="scope.row.state === 1"
              type="warning"
            >申请维修中</el-tag>
            <el-tag
              v-else-if="scope.row.state === 2"
              type="primary"
            >正在维修</el-tag>
            <el-tag
              v-else-if="scope.row.state === 3"
              type="success"
            >维修完成</el-tag>
            <el-tag
              v-else
              type="danger"
            >维修失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="维修证明人"
          prop="repairProverUserInfoName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        />
        <el-table-column
          label="操作"
          align="center"
          min-width="70px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              v-hasPermission="['repair:apply']"
              class="item"
              effect="dark"
              content="接受/拒绝 维修"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-sort table-operation"
                style="color: #E6A23C;"
                @click.stop="showRepairApplyDialog(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['repair:finish']"
              class="item"
              effect="dark"
              content="完成维修"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-check table-operation"
                style="color: #87d068;"
                @click.stop="repairFinish(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['repair:fail']"
              class="item"
              effect="dark"
              content="维修失败"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-close table-operation"
                style="color: #F56C6C;"
                @click.stop="repairFail(slope.row)"
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
                @click.stop="showEditDialog(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['repair:delete']"
              class="item"
              effect="dark"
              content="删除维修数据"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-delete"
                style="color: #000000;"
                @click.stop="deleteRepair(slope.row)"
              />
            </el-tooltip>
            <el-link
              v-has-no-permission="['repair:put','repair:delete','repair:get','repair:finish','repair:fail','repair:apply']"
              class="no-perm"
            >{{ $t('tips.noPermission') }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          type="expand"
          width="1"
        >
          <template
            slot-scope="props"
            class="tableExpand"
          >
            <el-form
              label-position="left"
              class="table-expand"
            >
              <el-row>
                <el-form-item label="发票:">
                  <template v-if="props.row.repairInvoice !== null">
                    <el-image
                      v-for="(item, i) in props.row.repairInvoice.split(',')"
                      :key="i"
                      class="showImage"
                      :src="item"
                      @click="showpreViewDialog(item)"
                    />
                  </template>
                </el-form-item>
              </el-row>
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
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="50%"
        top="3vh"
        @close="closeEditDialog"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="100px"
        >
          <el-form-item
            label="资产名称"
            prop="propertyName"
          >
            <el-input
              v-model="editForm.propertyName"
              disabled
            />
          </el-form-item>
          <el-form-item
            label="证明人名称"
            prop="repairProverUserInfoName"
          >
            <el-input
              v-model="editForm.repairProverUserInfoName"
              disabled
            />
          </el-form-item>
          <el-form-item
            label="维修价格"
            prop="repairPrice"
            type="number"
          >
            <el-input v-model.number="editForm.repairPrice" />
          </el-form-item>
          <el-form-item
            label="维修信息"
            prop="repairMessage"
          >
            <el-input v-model="editForm.repairMessage" />
          </el-form-item>
          <el-form-item
            label="维修日期"
            prop="repairDate"
          >
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
          <el-form-item
            label="发票"
            prop="repairInvoice"
          >
            <el-upload
              :before-upload="handleBeforeUpload"
              :before-remove="handleBeforeRemove"
              :on-success="editHandleSuccess"
              :on-change="editRepairInvoiceChange"
              :on-preview="handlePreview"
              :file-list="editFileList"
              :action="uploadUrl"
              :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
              :headers="headers"
              :limit="uploadPicLimit"
              list-type="picture-card"
              multiple
              drag
            >
              <i class="el-icon-plus" />
              <div
                slot="tip"
                style="display: block;"
                class="el-upload__tip"
              >请勿上传违法文件，可拖拽上传，可同时上传3个附件，且文件不超过5M</div>
            </el-upload>
          </el-form-item>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            type="warning"
            plain
            @click="editDialogVisible = false"
          >取 消</el-button>
          <el-button
            type="primary"
            plain
            @click="editRepair"
          >修 改</el-button>
        </span>
      </el-dialog>

      <!-- 图片预览 -->
      <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="40%"
        @close="previewDialogClose"
      >
        <el-image
          :src="previewPath"
          alt
          class="previewImg"
        />
      </el-dialog>

      <!-- 接受/拒绝维修对话框 -->
      <el-dialog
        title="接受/拒绝 维修"
        :visible.sync="repairApplyVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="50%"
        @close="closeRepairApplyDialog"
      >
        <span>是否接受该维修？</span>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            type="warning"
            plain
            @click="repairApply(0)"
          >拒 绝</el-button>
          <el-button
            type="primary"
            plain
            @click="repairApply(2)"
          >接 受</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { qiNiuUrl } from '@/settings'
import { getToken } from '@/utils/auth'
import { validatePicExt } from '@/utils/my-validate'
import Pagination from '@/components/Pagination'
export default {
  name: 'Index',
  components: { Pagination },
  data () {
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
        num: 1,
      },
      // 添加对话框的显示与隐藏
      drawerVisible: false,
      addDialogVisible: false,
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 绑定修改对话框中的表单数据
      editForm: {
        assetsName: '',
        repairPrice: 0,
        repairDate: '',
        repairInvoice: '',
        repairProverUserInfoUuid: '',
        id: 0,
        repairMessage: '',
      },
      // 修改对话框的验证规则
      editFormRules: {
        repairPrice: [
          {
            validator (rule, value, callback) {
              if (value === '' || value === null) {
                callback()
              }
              if (Number.isInteger(Number(value)) && Number(value) > 0) {
                callback()
              } else {
                callback(new Error('请输入有效数字'))
              }
            },
            trigger: 'blur',
          },
        ],
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      // 图片上传组件的headers请求头对象
      headers: {
        Authorization: `bearer ${getToken()}`,
      },
      // 上传图片的URL地址
      uploadUrl: qiNiuUrl,
      fileList: [],
      files: [],
      // 保存图片地址
      fileUrlList: [],
      editFileList: [],
      editListLength: 0,
      // 上传图片数量限制
      uploadPicLimit: 3,
      // 超过图片数量限制时隐藏上传组件
      editrepairinvoicehideupload: false,
      // 接受/拒绝维修对话框的显示与隐藏
      repairApplyVisible: false,
      // 存储一行数据
      row: {}
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.account.user
    },
  },
  mounted () {
    this.fetch()
  },
  methods: {
    // 根据条件获取所有考证信息
    fetch (params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0]
        params.createTimeTo = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/school/assets/repair', {
        ...params,
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.repairList = data.rows
        console.log(data)
        this.loading = false
      })
    },
    search () {
      this.fetch({
        ...this.queryParams,
        ...this.sort,
      })
    },
    // 搜索证书
    searchrepair () {
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
    resetrepair () {
      this.queryParams = {}
      this.fetch()
    },
    // 获取时间
    getTime: function () {
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
    async repairFinish (row) {
      // 检查维修状态
      if (row.state === 0 || row.state === 1) {
        return this.$message.error('请接受维修后再点击该按钮！')
      }
      if (row.state === 3) {
        return this.$message.error('该资产已维修完成！')
      }
      // 检查维修日期，价格是否填写
      if (row.repairDate === '' || row.repairDate === null) {
        return this.$message.error('请填写维修日期后再点击该按钮！')
      }
      if (row.repairPrice === '' || row.repairPrice === null) {
        return this.$message.error('请填写维修价格后再点击该按钮！')
      }

      // 符合条件，弹出完成维修对话框
      // this.reimbursementDialogVisible = true
      const confirmResult = await this.$confirm(
        '是否确认完成维修?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了该操作')
      }
      const schoolAssetsRepair = {
        id: row.id,
        state: 3
      }
      this.$put(`studio/school/assets/repair/state`, {
        ...schoolAssetsRepair,
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
    // 修改维修数据对话框
    showEditDialog (row) {
      if (row.state === 0 || row.state === 1) {
        return this.$message.error('仅在接受维修后才能修改维修数据！')
      }
      // 获得数据
      // 浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row)
      // console.log(this.editForm.repairInvoice);
      if (
        this.editForm.repairInvoice === null ||
        this.editForm.repairInvoice === ''
      ) {
        this.fileUrlList = []
      } else {
        this.fileUrlList = this.editForm.repairInvoice.split(',')
      }
      if (this.fileUrlList !== null) {
        for (var i = 0; i < this.fileUrlList.length; i++) {
          var fileurl = this.fileUrlList[i]
          if (fileurl !== null || fileurl !== '') {
            this.editFileList.push({
              name: fileurl.substring(28),
              url: fileurl,
            })
          }
        }
      }
      this.editListLength = this.fileUrlList.length
      this.editRepairInvoiceChange()
      this.editDialogVisible = true
    },
    // 提交修改对话框
    editRepair () {
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
    closeEditDialog () {
      this.$refs.editFormRef.resetFields()
      this.fileUrlList = []
      this.editFileList = []
      this.editListLength = 0
    },
    // 修改用户的发票上传成功后
    editHandleSuccess (response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      this.editListLength++
      if (
        this.editForm.repairInvoice === '' ||
        this.editForm.repairInvoice === null
      ) {
        this.editForm.repairInvoice = response.data.url
      } else {
        this.editForm.repairInvoice =
          this.editForm.repairInvoice + ',' + response.data.url
      }
      this.editFileList.push({
        name: response.data.url.substring(28),
        url: response.data.url,
      })
    },
    // 删除上传的图片，写死的（图片长度限定为3）
    handleBeforeRemove (file, fileList) {
      for (let n = 0; n < this.editFileList.length; n++) {
        if (this.editFileList[n].uid === file.uid) {
          console.log(this.editFileList)
          const fileUrl = this.editFileList[n].url
          const fileName = this.editFileList[n].url.substring(28).split('.')[0]
          this.$delete(`oss/content`, { fileName: fileName })
          // 根据图片数量分别执行删除的功能
          if (this.editFileList.length === 1) {
            console.log('111')
            this.editForm.repairInvoice = null
            this.editFileList = []
          } else if (this.editFileList.length === 2) {
            console.log('222')
            if (n === 0) {
              this.editForm.repairInvoice = this.editForm.repairInvoice.split(
                fileUrl + ','
              )[1]
              this.editFileList.shift()
            } else {
              this.editForm.repairInvoice = this.editForm.repairInvoice.split(
                ',' + fileUrl
              )[0]
              this.editFileList.pop()
            }
          } else {
            if (n === 0) {
              this.editForm.repairInvoice = this.editForm.repairInvoice.split(
                fileUrl + ','
              )[1]
              this.editFileList.shift()
            } else if (n === 1) {
              const firsturl = this.editForm.repairInvoice.split(
                ',' + fileUrl
              )[0]
              const lasturl = this.editForm.repairInvoice.split(
                ',' + fileUrl
              )[1]
              this.editForm.repairInvoice = firsturl + lasturl
              this.editFileList.splice(n, 1)
            } else {
              this.editForm.repairInvoice = this.editForm.repairInvoice.split(
                ',' + fileUrl
              )[0]
              this.editFileList.pop()
            }
          }
          this.editListLength--
          this.editRepairInvoiceChange()
          return true
        }
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 上传校验
    handleBeforeUpload (file) {
      if (file.size / 1024 > 5000) {
        this.$message({
          message: '上传文件大小不能超过5MB!',
          type: 'error',
        })
        return false
      } else {
        const ext = file.name.replace(/.+\./, '')
        if (!validatePicExt(ext)) {
          this.$message({
            type: 'error',
            message: '禁止上传' + ext + '类型的附件',
          })
          return false
        }
      }
    },
    // 查看发票图片
    showpreViewDialog (item) {
      this.previewPath = item
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose () {
      this.previewPath = ''
      this.previewVisible = false
    },
    // 手风琴效果
    toogleExpand (row, event, column) {
      const $table = this.$refs.tableref
      this.repairList.map((item) => {
        if (row.id !== item.id) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    // 监听发票图片数量是否超过限制，从而隐藏上传框
    editRepairInvoiceChange () {
      this.editrepairinvoicehideupload =
        this.editListLength >= this.uploadPicLimit
    },
    // 删除维修信息
    async deleteRepair (row) {
      const confirmResult = await this.$confirm(
        '是否确认删除维修?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了该操作')
      }
      this.$delete(`studio/school/assets/repair/${row.id}`, {
        ...this.Funding,
      }).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('删除成功!')
        } else {
          this.$message.error('删除失败！')
        }
        this.fetch()
      })
    },
    // 点击维修失败改变状态
    async repairFail (row) {
      // 检查维修状态
      if (row.state === 0 || row.state === 1) {
        return this.$message.error('请接受维修后再点击该按钮！')
      }
      if (row.state === 4) {
        return this.$message.error('该资产已维修失败！')
      }
      const confirmResult = await this.$confirm(
        '是否确认维修失败?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了该操作')
      }
      const schoolAssetsRepair = {
        id: row.id,
        state: 4
      }
      this.$put(`studio/school/assets/repair/state`, {
        ...schoolAssetsRepair,
      }).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('资产状态已变成维修失败!')
        } else {
          this.$message.error('提交失败！')
        }
        this.fetch()
      })
    },
    // 显示接受/拒绝 维修对话框
    showRepairApplyDialog (row) {
      // 检查维修状态
      if (row.state === 3) {
        return this.$message.error('此资产已维修完成！')
      }
      if (row.state === 4) {
        return this.$message.error('此资产已维修失败！')
      }
      this.row = row
      this.repairApplyVisible = true
    },
    // 接受/拒绝 维修
    repairApply (state) {
      const schoolAssetsRepair = {
        id: this.row.id,
        state: state
      }
      this.$put(`studio/school/assets/repair/state`, {
        ...schoolAssetsRepair,
      }).then((r) => {
        console.log('111')
        console.log(r)
        if (r.status === 200) {
          console.log(state)
          if (state === 2) {
            this.$message.success('已接受维修!')
          } else {
            this.$message.warning('已拒绝维修!')
          }
        } else {
          this.$message.error('提交失败！')
        }
        this.fetch()
      })
      this.closeRepairApplyDialog()
    },
    // 监听接受/拒绝 维修对话框的关闭
    closeRepairApplyDialog () {
      this.row = {}
      this.repairApplyVisible = false
    }
  },
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
.showImage {
  width: 100px;
  height: 100px;
  border: 1px solid black;
  margin-right: 30px;
  cursor: pointer;
}
</style>
