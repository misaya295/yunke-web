<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input v-model="queryParams.fullName" placeholder="姓名" class="filter-item search-item" />
      <el-input
        v-model="queryParams.corporationName"
        placeholder="公司名称"
        class="filter-item search-item"
      />
      <el-input v-model="queryParams.position" placeholder="职位" class="filter-item search-item" />
      <el-button
        v-hasPermission="['graduatedcorporation:get']"
        type="primary"
        class="filter-item"
        plain
        @click="searchGraduatedCorporation"
      >搜索</el-button>
      <el-button type="warning" class="filter-item" plain @click="resetGraduatedCorporation">重置</el-button>
      <el-button
        v-hasPermission="['graduatedcorporation:add']"
        type="success"
        class="filter-item table-operation"
        plain
        @click="showAddDialog"
      >添加</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="graduatedCorporationList" border fit style="width: 100%;">
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="姓名"
          prop="fullName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="公司名称"
          prop="corporationName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="200px"
        />
        <el-table-column
          label="职位"
          prop="position"
          :show-overflow-tooltip="true"
          align="center"
          min-width="200px"
        />
        <el-table-column
          label="操作"
          align="center"
          min-width="120px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              v-hasPermission="['graduatedcorporation:put']"
              class="item"
              effect="dark"
              content="修改去向"
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
              v-hasPermission="['graduatedcorporation:delete']"
              class="item"
              effect="dark"
              content="删除去向"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-delete table-operation"
                style="color: #F56C6C;"
                @click.stop="showDeleteDialog(slope.row)"
              />
            </el-tooltip>
            <el-link
              v-has-no-permission="['graduatedcorporation:get','graduatedcorporation:put','graduatedcorporation:delete']"
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

      <!-- 添加去向表单 -->
      <el-dialog title="添加去向" :visible.sync="addDialogVisible" @close="closeAddDialog">
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="addForm.fullName" disabled />
          </el-form-item>
          <el-form-item label="公司名称" prop="corporationName">
            <el-input v-model="addForm.corporationName" />
          </el-form-item>
          <el-form-item label="职位" prop="position">
            <el-input v-model="addForm.position" />
          </el-form-item>
          <el-form-item class="formbutton">
            <el-button class="addFormButton" @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" class="addFormButton" @click="addGraduatedCorporation">添 加</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改考证信息"
        :visible.sync="editDialogVisible"
        top="3vh"
        @close="closeEditDialog"
      >
        <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="editForm.fullName" disabled />
          </el-form-item>
          <el-form-item label="公司名称" prop="corporationName">
            <el-input v-model="editForm.corporationName" />
          </el-form-item>
          <el-form-item label="职位" prop="position">
            <el-input v-model="editForm.position" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGraduatedCorporation">修 改</el-button>
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
      // 存放查询数据
      graduatedCorporationList: null,
      // 存放查询数目
      total: 0,
      queryParams: {},
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
        corporationName: '',
        position: '',
        userId: 0
      },
      // 添加对话框的验证规则
      addFormRules: {
        corporationName: [
          { required: true, message: '请填写公司名称！', trigger: 'blur' }
        ]
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 绑定修改对话框中的表单数据
      editForm: {
        fullName: '',
        corporationName: '',
        position: '',
        userId: 0
      },
      // 修改对话框的验证规则
      editFormRules: {
        corporationName: [
          { required: true, message: '请填写公司名称！', trigger: 'blur' }
        ]
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
      this.$get('studio/graduated/corporation', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.graduatedCorporationList = data.rows
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

    // 展示添加去向对话框
    // 完成时记得打开检查id的判断
    showAddDialog() {
      // 获得id
      this.addForm.fullName = this.currentUser.fullName
      this.addForm.userId = this.currentUser.userId
      this.addDialogVisible = true
    },
    // 提交添加去向表单
    addGraduatedCorporation() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return
        this.$post('studio/graduated/corporation', {
          ...this.addForm
        }).then((r) => {
          if (r.status === 200) {
            this.$message.success('添加去向成功!')
            console.log(this.fileList)
          } else {
            this.$message.error('添加去向失败！')
          }
          this.fetch()
        })
        this.addDialogVisible = false
        this.$emit('success')
        this.addForm = {
          fullName: '',
          corporationName: '',
          position: '',
          userId: 0
        }
      })
    },
    // 监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
      this.activeIndex = '0'
      this.fileList = []
      this.addDialogVisible = false
      this.invoiceFileList = []
      this.invoiceFiles = []
      this.graduatedCorporationFileList = []
      this.graduatedCorporationFiles = []
    },
    // 搜索去向
    searchGraduatedCorporation() {
      console.log(this.queryParams)
      this.$get(`studio/graduated/corporation`, { ...this.queryParams }).then(
        (r) => {
          const data = r.data.data
          this.graduatedCorporationList = data.rows
          this.total = data.total
          console.log(r)
        }
      )
    },
    // 重置搜索框数据
    resetGraduatedCorporation() {
      this.queryParams = {}
      this.fetch()
    },
    // 修改去向对话框
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
      this.editDialogVisible = true
    },
    // 提交修改对话框
    editGraduatedCorporation() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return
        this.$put('studio/graduated/corporation', { ...this.editForm }).then(
          (r) => {
            if (r.status === 200) {
              this.$message.success('修改去向成功！')
              this.editDialogVisible = false
              this.fetch()
            } else {
              this.$message.error('修改去向失败！')
            }
          }
        )
      })
    },
    // 监听关闭修改对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除去向
    async showDeleteDialog(row) {
      // 判断是否有资格删除
      if (this.currentUser.userId !== row.userId) {
        if (this.currentUser.roleId !== '1') {
          return this.$message.info('仅允许本人或管理员操作！')
        }
      }
      const confirmResult = await this.$confirm('是否确认删除该去向?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const idStr = row.id + ''
      console.log(typeof idStr)
      this.$delete(`studio/graduated/corporation/${idStr}`).then((r) => {
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
