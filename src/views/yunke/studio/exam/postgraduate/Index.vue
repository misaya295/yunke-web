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
        v-hasPermission="['postgraduate:get']"
        type="primary"
        class="filter-item"
        plain
        @click="searchPostgraduate"
      >搜索</el-button>
      <el-button type="warning" class="filter-item" plain @click="resetPostgraduate">重置</el-button>
      <el-button
        v-hasPermission="['postgraduate:add']"
        type="success"
        class="filter-item"
        plain
        @click="showAddDialog"
      >添加</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="postgraduateList" border fit style="width: 100%;">
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="姓名"
          prop="fullName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="报考时间"
          prop="time"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="报考学校"
          prop="school"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="报考方向"
          prop="orientation"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        />
        <el-table-column
          label="统考成绩"
          prop="exam"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="通过状态"
          prop="success"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.success === 1" type="success">已通过</el-tag>
            <el-tag v-else-if="scope.row.success === 2" type="warning">未 知</el-tag>
            <el-tag v-else type="danger">未通过</el-tag>
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
          min-width="60px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              v-hasPermission="['postgraduate:put']"
              class="item"
              effect="dark"
              content="修改考研"
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
              v-hasPermission="['postgraduate:delete']"
              class="item"
              effect="dark"
              content="删除考研"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-delete table-operation"
                style="color: #F56C6C;"
                @click="showDeleteDialog(slope.row)"
              />
            </el-tooltip>
            <el-link
              v-has-no-permission="['postgraduate:put','postgraduate:delete']"
              class="no-perm"
            >{{ $t('tips.noPermission') }}</el-link>
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

      <!-- 添加对话框 -->
      <el-dialog title="添加考研" :visible.sync="addDialogVisible" @close="closeAddDialog">
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="addForm.fullName" disabled />
          </el-form-item>
          <el-form-item label="报考时间" prop="type">
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
          <el-form-item label="报考学校" prop="school">
            <el-input v-model="addForm.school" />
          </el-form-item>
          <el-form-item label="报考方向" prop="orientation" type="number">
            <el-input v-model="addForm.orientation" />
          </el-form-item>
          <el-form-item label="统考成绩" prop="exam">
            <el-input v-model="addForm.exam" />
          </el-form-item>
          <el-form-item label="通过状态" prop="success">
            <el-radio-group v-model="addForm.success">
              <el-radio :label="2">未知</el-radio>
              <el-radio :label="0">失败</el-radio>
              <el-radio :label="1">成功</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-radio-group v-model="addForm.state">
              <el-radio :label="0">正在考取</el-radio>
              <el-radio :label="1">已完成</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addPostgraduate">添 加</el-button>
        </span>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改考研信息"
        :visible.sync="editDialogVisible"
        @close="closeEditDialog"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="editForm.fullName" disabled />
          </el-form-item>
          <el-form-item label="报考时间" prop="type">
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
          <el-form-item label="报考学校" prop="school">
            <el-input v-model="editForm.school" />
          </el-form-item>
          <el-form-item label="报考方向" prop="orientation" type="number">
            <el-input v-model.number="editForm.orientation" />
          </el-form-item>
          <el-form-item label="统考成绩" prop="exam">
            <el-input v-model="editForm.exam" />
          </el-form-item>
          <el-form-item label="通过状态" prop="success">
            <el-radio-group v-model="editForm.success">
              <el-radio :label="2">未知</el-radio>
              <el-radio :label="0">失败</el-radio>
              <el-radio :label="1">成功</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-radio-group v-model="editForm.state">
              <el-radio :label="0">正在考取</el-radio>
              <el-radio :label="1">已完成</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editPostgraduate">修 改</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'Index',
  components: { Pagination },
  data() {
    return {
      // 输入框的值
      input: '',
      // 存放查询数据
      postgraduateList: [],
      // 存放查询数目
      total: 0,
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
      addDialogVisible: false,
      // 绑定添加对话框中的表单数据
      addForm: {
        fullName: '',
        userId: 0,
        time: '',
        school: '',
        orientation: '',
        exam: '',
        success: 2,
        state: 0
      },
      // 添加对话框的验证规则
      addFormRules: {
        success: [
          { required: true, message: '请填写通过状态！', trigger: 'blur' }
        ],
        state: [{ required: true, message: '请填写状态！', trigger: 'blur' }]
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 绑定修改对话框中的表单数据
      editForm: {
        fullName: '',
        id: 0,
        userId: '',
        time: '',
        school: '',
        title: '',
        orientation: '',
        exam: '',
        success: '',
        state: 0
      },
      // 修改对话框的验证规则
      editFormRules: {
        success: [
          { required: true, message: '请填写通过状态！', trigger: 'blur' }
        ],
        state: [{ required: true, message: '请填写状态！', trigger: 'blur' }]
      }
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
      this.$get('studio/postgraduate', {
        ...params
      }).then((r) => {
        console.log(r)
        const data = r.data.data
        this.total = data.total
        this.postgraduateList = data.rows
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

    // 展示对话框
    // 完成时记得打开检查id的判断
    showAddDialog() {
      // 获得id
      this.addForm.fullName = this.currentUser.fullName
      this.addForm.userId = this.currentUser.userId
      this.addDialogVisible = true
    },
    // 提交添加考证表单
    addPostgraduate() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return
        // 判断通过状态和考试状态是否冲突
        if (this.addForm.state === 0 && this.addForm.success === 1) {
          return this.$message.error('考试还未结束，无法将通过状态设置为成功!')
        }
        if (this.addForm.state === 0 && this.addForm.success === 0) {
          return this.$message.error('考试还未结束，无法将通过状态设置为失败!')
        }
        if (this.addForm.state === 1 && this.addForm.success === 2) {
          return this.$message.error('考试已结束，无法将通过状态设置为未知!')
        }
        this.$post('studio/postgraduate', {
          ...this.addForm
        }).then((r) => {
          if (r.status === 200) {
            this.$message.success('添加考研成功!')
          } else {
            this.$message.error('添加考研失败！')
          }
          this.fetch()
        })
        this.addForm = {
          fullName: '',
          userId: 0,
          time: '',
          school: '',
          orientation: '',
          exam: '',
          success: 2,
          state: 0
        }
        this.addDialogVisible = false
      })
    },
    // 监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 搜索考证
    searchPostgraduate() {
      console.log(this.queryParams)
      this.$get(`studio/postgraduate`, { ...this.queryParams }).then((r) => {
        const data = r.data.data
        this.postgraduateList = data.rows
        this.total = data.total
        console.log(r)
      })
    },
    // 重置搜索框数据
    resetPostgraduate() {
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
    // 修改考证对话框
    showEditDialog(row) {
      // 判断是否有资格修改
      console.log('1123')
      if (this.currentUser.userId !== row.userId) {
        if (this.currentUser.roleId !== '1') {
          return this.$message.info('仅允许本人或管理员操作！')
        }
      }
      // 获得数据
      // 浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row)
      this.editDialogVisible = true
    },
    // 提交修改对话框
    editPostgraduate() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return
        // 判断通过状态和考试状态是否冲突
        if (this.editForm.state === 0 && this.editForm.success === 1) {
          return this.$message.error('考试还未结束，无法将通过状态设置为成功!')
        }
        if (this.editForm.state === 0 && this.editForm.success === 0) {
          return this.$message.error('考试还未结束，无法将通过状态设置为失败!')
        }
        if (this.editForm.state === 1 && this.editForm.success === 2) {
          return this.$message.error('考试已结束，无法将通过状态设置为未知!')
        }
        this.$put('studio/postgraduate', { ...this.editForm }).then((r) => {
          if (r.status === 200) {
            this.$message.success('修改考证成功！')
            this.editDialogVisible = false
            this.fetch()
          } else {
            this.$message.error('修改考证失败！')
          }
        })
      })
    },
    // 监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除考研
    async showDeleteDialog(row) {
      // 判断是否有资格删除
      if (this.currentUser.userId !== row.userId) {
        if (this.currentUser.roleId !== '1') {
          return this.$message.info('仅允许本人或管理员操作！')
        }
      }
      const confirmResult = await this.$confirm(
        '是否确认删除该考研信息?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      this.$delete(`studio/postgraduate/${row.id}`).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('删除成功!')
        } else {
          this.$message.error('删除失败！')
        }
        this.fetch()
      })
    }
  }
}
</script>

<style scoped>
</style>
