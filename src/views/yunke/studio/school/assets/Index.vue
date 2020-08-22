<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input
        v-model="queryParams.assetsName"
        placeholder="资产名称"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.assetsNum"
        placeholder="资产编号"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.price"
        placeholder="资产价格"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.scrapDetail"
        placeholder="报废信息"
        class="filter-item search-item"
      />
      <el-button
        v-hasPermission="['assets:get']"
        type="primary"
        class="filter-item"
        plain
        @click="searchAssets"
      >搜索</el-button>
      <el-button
        type="warning"
        class="filter-item"
        plain
        @click="resetAssets"
      >重置</el-button>
      <el-button
        v-hasPermission="['assets:add']"
        type="success"
        class="filter-item"
        plain
        @click="showAddDialog"
      >添加</el-button>
      <!-- table内容 -->
      <el-table
        ref="tableref"
        :data="assetsList"
        border
        fit
        style="width: 100%;"
      >
        <el-table-column
          type="selection"
          align="center"
          width="40px"
        />
        <el-table-column
          label="资产名称"
          prop="assetsName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="资产编号"
          prop="assetsNum"
          :show-overflow-tooltip="true"
          align="center"
          min-width="90px"
        />
        <el-table-column
          label="资产价格"
          prop="price"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        />
        <el-table-column
          label="收录日期"
          prop="inclusionDate"
          :show-overflow-tooltip="true"
          align="center"
          min-width="100px"
        />
        <el-table-column
          label="报废日期"
          prop="scrapDate"
          :show-overflow-tooltip="true"
          align="center"
          min-width="100px"
        />
        <el-table-column
          label="报废信息"
          prop="scrapDetail"
          :show-overflow-tooltip="true"
          align="center"
          min-width="150px"
        />
        <el-table-column
          label="操作"
          align="center"
          min-width="80px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="slope">
            <el-tooltip
              v-hasPermission="['repair:add']"
              class="item"
              effect="dark"
              content="申请维修"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-coin table-operation"
                style="color: #87d068;"
                @click="showFixDialog(slope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-hasPermission="['assets:put']"
              class="item"
              effect="dark"
              content="修改资产"
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
              v-hasPermission="['assets:delete']"
              class="item"
              effect="dark"
              content="删除资产"
              placement="top"
              :enterable="false"
            >
              <i
                class="el-icon-delete table-operation"
                style="color: #F56C6C;"
                @click="deleteAssets(slope.row)"
              />
            </el-tooltip>
            <el-link
              v-has-no-permission="['repair:add','assets:put','assets:delete']"
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
      <el-dialog
        title="添加资产"
        :visible.sync="addDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="50%"
        @close="closeAddDialog"
      >
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addFormRules"
          label-width="100px"
        >
          <el-form-item
            label="资产名称"
            prop="assetsName"
          >
            <el-input v-model="addForm.assetsName" />
          </el-form-item>
          <el-form-item
            label="资产编号"
            prop="assetsNum"
          >
            <el-input v-model="addForm.assetsNum" />
          </el-form-item>
          <el-form-item
            label="资产价格"
            prop="price"
            type="number"
          >
            <el-input v-model="addForm.price" />
          </el-form-item>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            type="warning"
            plain
            @click="addDialogVisible = false"
          >取 消</el-button>
          <el-button
            type="primary"
            plain
            @click="addAssets"
          >添 加</el-button>
        </span>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改资产信息"
        :visible.sync="editDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="50%"
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
            prop="assetsName"
          >
            <el-input v-model="editForm.assetsName" />
          </el-form-item>
          <el-form-item
            label="资产编号"
            prop="assetsNum"
          >
            <el-input v-model="editForm.assetsNum" />
          </el-form-item>
          <el-form-item
            label="资产价格"
            prop="price"
            type="number"
          >
            <el-input v-model="editForm.price" />
          </el-form-item>
          <el-form-item
            label="报废日期"
            prop="scrapDate"
          >
            <el-date-picker
              v-model="editForm.scrapDate"
              type="date"
              placeholder="选择日期时间"
              align="right"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item
            label="报废信息"
            prop="scrapDetail"
          >
            <el-input v-model="editForm.scrapDetail" />
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
            @click="editAssets"
          >修 改</el-button>
        </span>
      </el-dialog>

      <!-- 申请维修-->
      <el-dialog
        title="申请维修"
        :visible.sync="fixDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="50%"
        @close="closeFixDialog"
      >
        <el-form
          ref="fixFormRef"
          :model="fixForm"
          :rules="fixFormRules"
          label-width="100px"
        >
          <el-form-item
            label="资产名称"
            prop="assetsName"
          >
            <el-input
              v-model="fixForm.propertyName"
              disabled
            />
          </el-form-item>
          <el-form-item
            label="维修信息"
            prop="repairMessage"
          >
            <el-input v-model="fixForm.repairMessage" />
          </el-form-item>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            type="warning"
            plain
            @click="fixDialogVisible = false"
          >取 消</el-button>
          <el-button
            type="primary"
            plain
            @click="fixAssets"
          >申 请</el-button>
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
  data () {
    return {
      // 存放查询数据
      assetsList: null,
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
      addDialogVisible: false,
      // 绑定添加对话框中的表单数据
      addForm: {
        id: 0,
        assetsName: '',
        assetsNum: '',
        price: 0,
        inclusionDate: '',
      },
      // 添加对话框的验证规则
      addFormRules: {
        assetsName: [
          { required: true, message: '请填写资产名称！', trigger: 'blur' },
        ],
        assetsNum: [
          { required: true, message: '请填写资产编号！', trigger: 'blur' },
        ],
        price: [
          {
            validator (rule, value, callback) {
              if (value === '') {
                callback()
              }
              if (Number(value) >= 0) {
                callback()
              } else {
                callback(new Error('请输入有效数字'))
              }
            },
            trigger: 'blur',
          },
        ],
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 绑定修改对话框中的表单数据
      editForm: {
        id: 0,
        assetsName: '',
        assetsNum: '',
        price: '',
        inclusionDate: '',
        scrapDate: '',
        scrapDetail: '',
      },
      // 修改对话框的验证规则
      editFormRules: {
        assetsName: [
          { required: true, message: '请填写资产名称！', trigger: 'blur' },
        ],
        assetsNum: [
          { required: true, message: '请填写资产编号！', trigger: 'blur' },
        ],
        price: [
          {
            validator (rule, value, callback) {
              if (value === '') {
                callback()
              }
              if (Number(value) >= 0) {
                callback()
              } else {
                callback(new Error('请输入有效数字'))
              }
            },
            trigger: 'blur',
          },
        ],
      },
      // 报修所需的对象
      schoolAssetsRepair: {
        assetsName: '',
        repairProverUserInfoUuid: 0,
        repairMessage: '',
      },
      // 申请维修对话框的显示与隐藏
      fixDialogVisible: false,
      // 绑定申请维修对话框中的表单数据
      fixForm: {
        propertyName: '',
        assetsName: '',
        repairProverUserInfoUuid: 0,
        repairMessage: '',
      },
      // 申请维修对话框的验证规则
      fixFormRules: {
        repairMessage: [
          { required: true, message: '请填写维修信息！', trigger: 'blur' },
        ],
      },
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
      this.$get('studio/school/assets', {
        ...params,
      }).then((r) => {
        const d = r.data.data
        this.total = d.total
        this.assetsList = d.rows
        console.log(r)
        this.loading = false
      })
    },
    search () {
      this.fetch({
        ...this.queryParams,
        ...this.sort,
      })
    },

    // 展示对话框
    showAddDialog () {
      this.addDialogVisible = true
    },
    // 提交添加资产表单
    addAssets () {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return
        // 如果费用为空，则把它转为数字类型
        if (this.addForm.price === '') {
          this.addForm.price = '' - 0
        }
        // 将当前时间作为收录日期
        this.addForm.inclusionDate = this.getTime()
        this.$post('studio/school/assets', {
          ...this.addForm,
        }).then((r) => {
          if (r.status === 200) {
            this.$message.success('添加资产成功!')
          } else {
            this.$message.error('添加资产失败！')
          }
          this.fetch()
        })
        this.addDialogVisible = false
      })
    },
    // 监听关闭对话框事件
    closeAddDialog () {
      this.$refs.addFormRef.resetFields()
    },
    // 搜索资产
    searchAssets () {
      console.log(this.queryParams)
      this.$get(`studio/school/assets`, { ...this.queryParams }).then((r) => {
        const data = r.data.data
        this.assetsList = data.rows
        this.total = data.total
        console.log(r)
      })
    },
    // 重置搜索框数据
    resetAssets () {
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
      _this.nowDate = yy + '-' + mm + '-' + dd
      return _this.nowDate
    },
    // 弹出申请维修确认框
    showFixDialog (row) {
      // 检查是否已经报修
      const searchByAssetsName = {}
      searchByAssetsName.assetsName = row.id
      this.$get('studio/school/assets/repair', { ...searchByAssetsName }).then(
        (r) => {
          const dataList = r.data.data.rows
          const flag = dataList.every(function (item) {
            return item.repairDate !== null && item.repairPrice !== null
          })
          if (!flag) {
            this.$message.warning('该资产还有未完成的维修工作，请谨慎添加！')
            setTimeout(() => {
              this.fixForm.propertyName = row.assetsName
              this.fixForm.assetsName = row.id
              this.fixForm.repairProverUserInfoUuid = this.currentUser.userId
              this.fixDialogVisible = true
            }, 1000);
          } else {
            this.fixForm.propertyName = row.assetsName
            this.fixForm.assetsName = row.id
            this.fixForm.repairProverUserInfoUuid = this.currentUser.userId
            this.fixDialogVisible = true
          }
        }
      )
    },
    // 监听关闭对话框事件
    closeFixDialog () {
      this.$refs.fixFormRef.resetFields()
    },
    // 提交申请维修表单
    fixAssets (row) {
      console.log('123123123')
      console.log(this.fixForm)
      this.$post('studio/school/assets/repair', {
        ...this.fixForm,
      }).then((r) => {
        if (r.status === 200) {
          this.$message.success('报修成功!')
        } else {
          this.$message.error('报修失败！')
        }
        this.fixDialogVisible = false
      })
    },
    // 修改证书对话框
    showEditDialog (row) {
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
    editAssets () {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return
        this.$put('studio/school/assets', { ...this.editForm }).then((r) => {
          console.log(r)
          if (r.status === 200) {
            this.$message.success('修改资产成功！')
            this.editDialogVisible = false
            this.fetch()
          } else {
            this.$message.error('修改资产失败！')
          }
        })
      })
    },
    // 监听关闭对话框事件
    closeEditDialog () {
      this.$refs.editFormRef.resetFields()
    },
    // 删除资产
    async deleteAssets (row) {
      // 判断是否有资格删除
      if (this.currentUser.userId !== row.userId) {
        if (this.currentUser.roleId !== '1') {
          return this.$message.info('仅允许本人或管理员操作！')
        }
      }
      // 符合条件，弹出确认对话框
      const confirmResult = await this.$confirm(
        '被删除的数据将无法恢复，是否确认删除?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }

      this.$delete(`studio/school/assets/${row.id}`).then((r) => {
        console.log(r)
        if (r.status === 200) {
          this.$message.success('该资产已成功删除！')
        } else {
          this.$message.error('删除失败！')
        }
        this.fetch()
      })
    },
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
  width: 50%;
}
</style>
