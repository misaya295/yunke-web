<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryParams.title" placeholder="标题" class="filter-item search-item" />
      <el-input v-model="queryParams.fullName" placeholder="姓名" class="filter-item search-item" />
      <el-input v-model="copyrightId" placeholder="著作权id" class="filter-item search-item" />
      <el-date-picker
        v-model="queryParams.timeRange"
        :range-separator="null"
        :start-placeholder="$t('table.user.createTime')"
        value-format="yyyy-MM-dd"
        class="filter-item search-item date-range-item"
        type="daterange"
      />
     <el-select  v-model="queryParams.reimbursement"  value="" placeholder="是否已报销">
          <el-option
            v-for="item in whether"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      <el-button class="filter-item" type="primary" plain @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" plain @click="reset">
        {{ $t('table.reset') }}
      </el-button>
     <el-dropdown v-has-any-permission="['task:add','task:delete','task:reset','task:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['task:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:reset']" @click.native="resetPassword">{{ $t('table.resetPassword') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  <!-- 表格区域 -->
    <el-table
      ref="table"
      :key="tableKey"
      :data="listRows"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <!-- 著作权id -->
      <el-table-column  label="著作权id" prop="copyrightId" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.copyrightId }}</span>
        </template>
      </el-table-column>
      <!-- 项目id -->
      <el-table-column  label="项目id" prop="itemsId" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.itemId }}</span>
        </template>
      </el-table-column>
      <!-- 著作权标题 -->
      <el-table-column  label="标题" prop="title"  :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
       <!-- 著作权摘要 -->
      <el-table-column label="摘要" prop="introduction" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
       <!-- 著作权开始时间 -->
      <el-table-column label="开始时间" prop="startTime" align="center" min-width="180px" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <!-- 项目结束时间  -->
      <el-table-column label="结束时间" prop="endTime" align="center" min-width="180px" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
       <!-- 项目花费  -->
       <el-table-column label="花费"  prop="cost" :show-overflow-tooltip="true" align="center" min-width="150px">
      <template slot-scope="scope">
          <span>{{ scope.row.cost }}</span>
        </template>
      </el-table-column>
      <!-- 著作权发票  -->
      <el-table-column label="发票" prop="invoice" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.invoice }}</span>
        </template>
      </el-table-column>
      <!-- 著作权证书  -->
      <el-table-column label="证书" prop="certificate" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.certificate }}</span>
        </template>
      </el-table-column>
      <!-- 著作权申请书  -->
      <el-table-column label="申请书" prop="applicationForm" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.applicationForm }}</span>
        </template>
      </el-table-column>
      <!-- 著作权源文件  -->
      <el-table-column label="源文件"  prop="originFile" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.originFile }}</span>
        </template>
      </el-table-column>
      <!-- 著作权软件协议  -->
      <el-table-column label="软件协议"  prop="agreement" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.agreement }}</span>
        </template>
      </el-table-column>
      <!-- 著作权状态  -->
       <el-table-column
        label="状态"
        :filters="[{ text: '进行中', value: '1' }, { text: '已完成', value: '2' }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.status === '1' ? '进行中' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
         <!-- 著作权是否报销  -->
       <el-table-column
        label="是否报销"
        :filters="[{ text: '否', value: '0' }, { text: '是', value: '1' }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.reimbursement | whetherFilter">
            {{ row.status === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-hasPermission="['task:view']" class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
          <i v-hasPermission="['task:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i v-hasPermission="['task:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <el-link v-has-no-permission="['task:view','task:update','task:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <tasks-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
     <tasks-view
      ref="view"
      :dialog-visible="taskViewVisible"
      @close="viewClose"
    />
  </div>
</template>

<script>
import TasksEdit from './Edit'
import TasksView from './View'
import Pagination from '@/components/Pagination'

export default {
  name: 'TaskItems',
  components: { Pagination, TasksEdit, TasksView },
  filters: {
    statusFilter(status) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[status]
    },
    whetherFilter(status) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[status]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      taskViewVisible: false,
      queryParams: {},
      tableKey: 0,
      total: 0,
      pagination: {
        size: 10,
        num: 1
      },
      sort: {},
      selection: [],
      // 著作权数据
      listRows: [],
      whether: [{
        id: 0,
        name: '未报销'
      },
      {
        id: 1,
        name: '已报销'
      }
      ],
      copyrightId: '',
      tasksRoles: [{
        roleId: 1,
        roleName: '负责人'
      },
      {
        roleId: 2,
        roleName: '成员'
      }
      ]
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  created() {
    this.fetch()
  },
  methods: {
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    viewClose() {
      this.taskViewVisible = false
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    search() {
      if (this.copyrightId !== '') {
        this.getIdInfo(this.copyrightId)
        return ''
      }
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    getIdInfo(id) {
      this.$get(`studio/copyright/${id}`).then((r) => {
        const data = r.data.data
        data.startTime = data.start_time
        data.endTime = data.end_time
        data.itemId = data.item_id
        data.copyrightId = data.copyright_id
        const arr = []
        arr.push(data)
        this.listRows = arr
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      let contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const copyrightIds = []
        this.selection.forEach((u) => {
          // 不能删除自己xxx
          if (u.copyrightId === this.currentUser.copyrightId) {
            contain = true
            return
          }
          copyrightIds.push(u.copyrightId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containCurrentUser'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(copyrightIds)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    delete(itemsIds) {
      this.loading = true
      this.$delete(`studio/copyright/${itemsIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    view(row) {
      this.$get(`studio/copyright/${row.copyrightId}`).then((r) => {
        let uResult = ''
        let SResult = ''
        const data = r.data.data
        let userId = []
        let userState = []
        if (data.userId && typeof data.userId === 'string') {
          userId = data.userId.split(',')
        }
        if (data.user_state && typeof data.user_state === 'string') {
          userState = data.user_state.split(',')
        }
        this.$get('system/user').then((r) => {
          const rows = r.data.data.rows
          let count = 0
          rows.forEach((v, i) => {
            userId.forEach((v1, i1) => {
              if (v1 === ('' + v.userId)) {
                if (count > 0) {
                  uResult += '，'
                }
                uResult += v.fullName
                count++
              }
            })
          })
          count = 0
          this.tasksRoles.forEach((v, i) => {
            userState.forEach((v1, i1) => {
              if (v1 === (''+ v.roleId)) {
                if (count > 0) {
                  SResult += '，'
                }
                SResult += v.roleName
                count++
              }
            })
          })
          data.userId = uResult
          data.user_state = SResult
          this.$refs.view.setTasks(data)
          this.taskViewVisible = true
        })
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    edit(row) {
      this.$refs.edit.setCopyRight(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.startTime = this.queryParams.timeRange[0]
        params.endTime = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/copyright', {
        ...params
      }).then((r) => {
        console.log(r)
        const data = r.data.data
        this.total = data.total
        this.listRows = data.rows
        this.loading = false
      })
    },
    sortChange(val) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    },
    filterStatus(value, row) {
      return row.status === value
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
