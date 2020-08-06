<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input v-model="queryParams.fullName" placeholder="姓名" class="filter-item search-item" />
      <el-select v-model="queryParams.state" placeholder="请选择考试状态" class="filter-item search-item">
        <el-option
          v-for="(item,i) in stateOptions"
          :key="i"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        v-hasPermission="['certificate:get']"
        type="primary"
        class="filter-item"
        plain
        @click="searchCertificate"
      >搜索</el-button>
      <el-button type="warning" class="filter-item" plain @click="resetCertificate">重置</el-button>
      <el-button
        v-hasPermission="['certificate:add']"
        type="success"
        class="filter-item table-operation"
        plain
        @click="showAddDialog"
      >添加</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="certificateList" border fit style="width: 100%;">
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="姓名"
          prop="fullName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="类型"
          prop="type"
          :show-overflow-tooltip="true"
          align="center"
          min-width="90px"
        />
        <el-table-column
          label="证书名称"
          prop="title"
          :show-overflow-tooltip="true"
          align="center"
          min-width="150px"
        />
        <el-table-column
          label="费用"
          prop="cost"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        />
        <el-table-column
          label="考证时间"
          prop="time"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="通过状态"
          prop="success"
          :show-overflow-tooltip="true"
          align="center"
          min-width="70px"
        >
          <template slot-scope="scope">
            <i v-if="scope.row.success === 1" class="el-icon-success" style="color: lightgreen" />
            <i v-else class="el-icon-error" style="color: red" />
          </template>
        </el-table-column>
        <el-table-column
          label="是否已报销"
          prop="reimbursement"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        >
          <template slot-scope="scope">
            <i
              v-if="scope.row.reimbursement === 1"
              class="el-icon-success"
              style="color: lightgreen"
            />
            <i v-else class="el-icon-error" style="color: red" />
          </template>
        </el-table-column>
        <el-table-column
          label="考试状态"
          prop="state"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.state === 0" type="warning">正在考取</el-tag>
            <el-tag v-else type="success">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          min-width="120px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              v-hasPermission="['funding:add']"
              class="item"
              effect="dark"
              content="申请报销"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-coin table-operation"
                style="color: #87d068;"
                @click="changeReimbursement(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['certificate:put']"
              class="item"
              effect="dark"
              content="修改证书"
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
              v-hasPermission="['certificate:delete']"
              class="item"
              effect="dark"
              content="删除证书"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-delete table-operation"
                style="color: #F56C6C;"
                @click="showDeleteDialog(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['certificate:get']"
              class="item"
              effect="dark"
              content="查看详情"
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
              v-has-no-permission="['certificate:get','certificate:put','certificate:delete']"
              class="no-perm"
            >{{ $t('tips.noPermission') }}</el-link>
          </template>
        </el-table-column>
        <el-table-column type="expand" width="1px">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-form-item label="考证ID:">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="发票:">
                <ul class="invoiceUl">
                  <li
                    v-for="(item, i) in props.row.invoice.split(',')"
                    :key="i"
                    class="invoiceLi"
                    @click="showpreViewDialog(item)"
                  >{{ item }}</li>
                </ul>
              </el-form-item>
              <el-form-item label="证书:">
                <span>{{ props.row.certificate }}</span>
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

      <!-- 添加考证抽屉 -->
      <el-drawer title="添加考证" :visible.sync="drawerVisible" size="50%" @close="closeAddDialog">
        <!-- 步骤条区域 -->
        <el-steps
          :space="200"
          :active="activeIndex - 0"
          finish-status="success"
          align-center
          class="addFormSteps"
        >
          <el-step title="基本信息" />
          <el-step title="发票上传" />
        </el-steps>
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="100px"
          style="margin-right: 100px"
        >
          <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="姓名" prop="fullName">
                <el-input v-model="addForm.fullName" disabled />
              </el-form-item>
              <el-form-item label="类型" prop="type">
                <el-input v-model="addForm.type" />
              </el-form-item>
              <el-form-item label="证书名称" prop="title">
                <el-input v-model="addForm.title" />
              </el-form-item>
              <el-form-item label="费用" prop="cost" type="number">
                <el-input v-model.number="addForm.cost" />
              </el-form-item>
              <el-form-item label="考证时间" prop="time">
                <el-date-picker
                  v-model="addForm.time"
                  type="date"
                  placeholder="选择日期"
                  align="right"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="证书" prop="certificate">
                <el-input v-model="addForm.certificate" />
              </el-form-item>
              <el-form-item label="通过状态" prop="success">
                <el-radio-group v-model="addForm.success">
                  <el-radio :label="0">失败</el-radio>
                  <el-radio :label="1">成功</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="是否已报销" prop="reimbursement">
                <el-radio-group v-model="addForm.reimbursement">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="考试状态" prop="state">
                <el-select v-model="addForm.state" placeholder="请选择状态" style="width:100%">
                  <el-option label="正在考取" :value="0" />
                  <el-option label="已完成" :value="1" />
                </el-select>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="发票上传" name="1">
              <el-upload
                :before-upload="handleBeforeUpload"
                :before-remove="handleBeforeRemove"
                :on-success="addHandleSuccess"
                :file-list="fileList"
                :action="uploadUrl"
                class="upload-demo"
                :headers="headers"
                multiple
                :limit="3"
                :on-preview="handlePreview"
                list-type="picture-card"
                :disabled="files.length===3?true:false"
              >
                <i v-if="files.length<3" class="el-icon-plus" />
                <i v-else class="el-icon-close" />
                <div
                  slot="tip"
                  style="display: block;"
                  class="el-upload__tip"
                >请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
              </el-upload>
              <el-form-item class="formbutton">
                <el-button class="addFormButton" @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" class="addFormButton" @click="addCertificate">添 加</el-button>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-drawer>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改考证信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeEditDialog"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="editForm.fullName" disabled />
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-input v-model="editForm.type" />
          </el-form-item>
          <el-form-item label="证书名称" prop="title">
            <el-input v-model="editForm.title" />
          </el-form-item>
          <el-form-item label="费用" prop="cost" type="number">
            <el-input v-model.number="editForm.cost" />
          </el-form-item>
          <el-form-item label="考证时间" prop="time">
            <el-date-picker
              v-model="editForm.time"
              type="date"
              placeholder="选择日期"
              align="right"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="证书" prop="certificate">
            <el-input v-model="editForm.certificate" />
          </el-form-item>
          <el-form-item label="通过状态" prop="success">
            <el-radio-group v-model="editForm.success">
              <el-radio :label="0">失败</el-radio>
              <el-radio :label="1">成功</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-select v-model="editForm.state" placeholder="请选择状态" style="width:100%">
              <el-option label="正在考取" :value="0" />
              <el-option label="已完成" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="发票" prop="invoice">
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
              :disabled="editFileList.length===3?true:false"
            >
              <i v-if="editFileList.length<3" class="el-icon-plus" />
              <i v-else class="el-icon-close" />
              <div
                slot="tip"
                style="display: block;"
                class="el-upload__tip"
              >请勿上传违法文件，可同时上传3个附件，且文件不超过5M，已上传的文件无法删除！</div>
            </el-upload>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCertificate">修 改</el-button>
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
      certificateList: null,
      // 存放查询数目
      total: 0,
      list: null,
      queryParams: {},
      stateOptions: [
        {
          value: '0',
          label: '正在考取'
        },
        {
          value: '1',
          label: '已完成'
        }
      ],
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      },
      // 添加对话框的显示与隐藏
      drawerVisible: false,
      addDialogVisible: false,
      // 绑定添加对话框中的表单数据
      addForm: {
        fullName: '',
        type: '',
        title: '',
        cost: '',
        time: '',
        invoice: '',
        certificate: '',
        success: 0,
        reimbursement: 0,
        state: undefined,
        userId: 0
      },
      // 添加对话框的验证规则
      addFormRules: {
        type: [{ required: true, message: '请填写类型！', trigger: 'blur' }],
        title: [
          { required: true, message: '请填写证书名称！', trigger: 'blur' }
        ],
        cost: [
          {
            validator(rule, value, callback) {
              if (value === '') {
                callback()
              }
              if (Number.isInteger(Number(value)) && Number(value) >= 0) {
                callback()
              } else {
                callback(new Error('请输入有效数字'))
              }
            },
            trigger: 'blur'
          }
        ],
        time: [
          { required: true, message: '请填写考证时间！', trigger: 'blur' }
        ],
        success: [
          { required: true, message: '请填写通过状态！', trigger: 'blur' }
        ],
        reimbursement: [
          { required: true, message: '请填写是否已报销！', trigger: 'blur' }
        ],
        state: [{ required: true, message: '请填写状态！', trigger: 'blur' }]
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 绑定修改对话框中的表单数据
      editForm: {
        fullName: '',
        type: '',
        title: '',
        cost: '',
        time: '',
        invoice: '',
        certificate: '',
        success: 0,
        reimbursement: 0,
        state: undefined,
        userId: 0
      },
      // 修改对话框的验证规则
      editFormRules: {
        type: [{ required: true, message: '请填写类型！', trigger: 'blur' }],
        title: [
          { required: true, message: '请填写证书名称！', trigger: 'blur' }
        ],
        cost: [
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
        ],
        time: [
          { required: true, message: '请填写考证时间！', trigger: 'blur' }
        ],
        success: [
          { required: true, message: '请填写通过状态！', trigger: 'blur' }
        ],
        reimbursement: [
          { required: true, message: '请填写是否已报销！', trigger: 'blur' }
        ],
        state: [{ required: true, message: '请填写状态！', trigger: 'blur' }]
      },
      // 申请报销所需的资金对象
      Funding: {
        name: '',
        applyTime: '',
        proposerId: 0
      },
      activeIndex: 0,
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
      this.$get('studio/certificate', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.certificateList = data.rows
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

    // 展示添加证书对话框
    // 完成时记得打开检查id的判断
    showAddDialog() {
      // 获得id
      this.addForm.fullName = this.currentUser.fullName
      this.addForm.userId = this.currentUser.userId
      this.drawerVisible = true
      this.addDialogVisible = true
    },
    // 提交添加证书表单
    addCertificate() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return
        // 判断通过状态和考试状态是否冲突
        if (this.addForm.state === 0 && this.addForm.success === 1) {
          return this.$message.error('考试还未结束，无法将通过状态设置为成功!')
        }
        // 如果费用为空，则把它转为数字类型
        if (this.addForm.cost === '') {
          this.addForm.cost = '' - 0
        }
        this.$post('studio/certificate', {
          ...this.addForm
        }).then((r) => {
          if (r.status === 200) {
            this.$message.success('添加证书成功!')
            console.log(this.fileList)
          } else {
            this.$message.error('添加证书失败！')
          }
          this.fetch()
        })
        this.addDialogVisible = false
        this.drawerVisible = false
        this.fileList = []
        this.dialogImageUrl = ''
        this.$emit('success')
        this.addForm = {
          fullName: '',
          type: '',
          title: '',
          cost: '',
          time: '',
          invoice: '',
          certificate: '',
          success: 0,
          reimbursement: 0,
          state: undefined,
          userId: 0
        }
      })
    },
    // 监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
      this.activeIndex = '0'
      this.fileList = []
      this.drawerVisible = false
      for (let i = 0; i < this.files.length; i++) {
        this.$delete(`oss/content/${this.files[i].id}`)
      }
    },
    // 搜索证书
    searchCertificate() {
      console.log(this.queryParams)
      this.$get(`studio/certificate`, { ...this.queryParams }).then((r) => {
        const data = r.data.data
        this.certificateList = data.rows
        this.total = data.total
        console.log(r)
      })
    },
    // 重置搜索框数据
    resetCertificate() {
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
      _this.nowDate = yy + '-' + mm + '-' + dd
      return _this.nowDate
    },
    // 弹出申请报销对话框
    async changeReimbursement(row) {
      console.log(row)
      if (this.currentUser.userId !== row.userId) {
        return this.$message.info('仅允许本人操作！')
      }
      // 检查是否已报销
      if (row.reimbursement === 1) {
        return this.$message.info('此证书已经报销！')
      }
      // 检查考试是否完成
      if (row.state === 0) {
        return this.$message.info('考试还未结束，请考试结束后再申请报销!')
      }
      // 检查考试是否通过
      if (row.success === 0) {
        return this.$message.info('考试未通过，请通过考试再申请报销！')
      }

      // 符合条件，弹出申请报销对话框
      // this.reimbursementDialogVisible = true
      const confirmResult = await this.$confirm(
        '您的报销条件已符合, 是否确认报销?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了报销')
      }

      this.Funding.applyTime = this.getTime()
      this.Funding.proposerId = row.userId
      this.Funding.name = '考' + row.title + '证书报销'
      console.log(this.Funding)
      this.$post('studio/funding', {
        ...this.Funding
      }).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('报销成功!')
        } else {
          this.$message.error('报销失败！')
        }
      })
    },
    // 修改证书对话框
    showEditDialog(row) {
      // 判断是否有资格修改
      if (this.currentUser.userId !== row.userId) {
        if (this.currentUser.roleId !== '1') {
          return this.$message.info('仅允许本人或管理员操作！')
        }
      }
      // 获得数据
      // 浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row)
      if (this.editForm.invoice.length > 1) {
        this.fileUrlList = this.editForm.invoice.split(',')
      } else {
        this.fileUrlList = this.editForm.invoice
      }
      for (var i = 0; i < this.fileUrlList.length; i++) {
        var fileurl = this.fileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.editFileList.push({
            name: fileurl.substring(28),
            url: fileurl
          })
        }
      }
      console.log(this.editFileList)
      this.editDialogVisible = true
    },
    // 提交修改对话框
    editCertificate() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return
        // 判断通过状态和考试状态是否冲突
        if (this.editForm.state === 0 && this.editForm.success === 1) {
          return this.$message.error('考试还未结束，无法将通过状态设置为成功!')
        }
        // 把考证ID转为字符串
        this.editForm.id = this.editForm.id - 0
        this.$put('studio/certificate', { ...this.editForm }).then((r) => {
          if (r.status === 200) {
            this.$message.success('修改证书成功！')
            this.editDialogVisible = false
            this.fetch()
          } else {
            this.$message.error('修改证书失败！')
          }
        })
      })
    },
    // 监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
      this.fileUrlList = []
      this.editFileList = []
    },
    // 切换tab时判断是否填完基本信息
    beforeTabLeave(activeName, oldActiveName) {
      console.log(activeName)
      console.log(oldActiveName)
      if (oldActiveName === '0') {
        if (this.addForm.type === '' || this.addForm.type === null) {
          this.$message.error('请先填写类型')
          return false
        }
      }
      if (oldActiveName === '0') {
        if (this.addForm.title === '' || this.addForm.title === null) {
          this.$message.error('请先填写证书名称')
          return false
        }
      }
      if (oldActiveName === '0') {
        if (this.addForm.time === '' || this.addForm.time === null) {
          this.$message.error('请先填写考证时间')
          return false
        }
      }
      if (oldActiveName === '0') {
        if (this.addForm.state == null) {
          this.$message.error('请先填写考试状态')
          return false
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
    // 新建用户的发票上传成功后
    addHandleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.addForm.invoice === '' || this.addForm.invoice === null) {
        this.addForm.invoice = response.data.url
      } else {
        this.addForm.invoice = this.addForm.invoice + ',' + response.data.url
      }
    },
    // 修改用户的发票上传成功后
    editHandleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.editForm.invoice === '' || this.editForm.invoice === null) {
        this.editForm.invoice = response.data.url
      } else {
        this.editForm.invoice = this.editForm.invoice + ',' + response.data.url
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
    // 删除证书
    async showDeleteDialog(row) {
      // 判断是否有资格删除
      if (this.currentUser.userId !== row.userId) {
        if (this.currentUser.roleId !== '1') {
          return this.$message.info('仅允许本人或管理员操作！')
        }
      }
      const confirmResult = await this.$confirm('是否确认删除该证书?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      this.$delete(`studio/certificate/${row.id}`).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('删除成功!')
        } else {
          this.$message.error('删除失败！')
        }
        this.fetch()
      })
    },
    // 手风琴效果
    toogleExpand(row) {
      const $table = this.$refs.tableref
      this.certificateList.map((item) => {
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
.addFormButton {
  text-align: center;
}

.formbutton {
  margin-top: 20px;
  padding-left: 290px;
}
.addFormSteps {
  margin: 0 0 20px 150px;
}
.previewImg {
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
