<template>
  <div class="app-container">
   <div class="filter-container">
        <!-- 任务id -->
        <!-- <el-input v-model="thesisId" placeholder="任务id" class="filter-item search-item" /> -->
        <!-- 标题 -->
        <el-input v-model="queryParams.title" placeholder="标题"  class="filter-item search-item"/>
        <!-- 是否已报销 -->
        <el-select  v-model="queryParams.reimbursement"  value="" placeholder="是否已报销">
          <el-option
            v-for="thesis in whether"
            :key="thesis.id"
            :label="thesis.name"
            :value="thesis.id"
          />
        </el-select>
        <!-- 真实姓名 -->
        <el-input v-model="queryParams.fullName" placeholder="真实姓名"  class="filter-item search-item"/>
        <!-- 搜索 -->
        <el-button class="filter-item" type="primary" plain @click="search">
            {{ $t('table.search') }}
        </el-button>
        <!-- 重置 -->
        <el-button class="filter-item" type="warning" plain @click="reset">
            {{ $t('table.reset') }}
        </el-button>
        <!-- 更多操作 -->
        <el-dropdown v-has-any-permission="['task:add','task:delete','task:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['task:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  <!-- 表格区域 -->
  <el-table
      ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <!-- 论文id -->
      <el-table-column label='任务Id' prop="thesisId" :show-overflow-tooltip="true" align="center" min-width="130px">
        <template slot-scope="scope">
          <span>{{ scope.row.thesisId }}</span>
        </template>
      </el-table-column>
      <!-- 论文标题 -->
      <el-table-column label='标题' prop="title" :show-overflow-tooltip="true" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
       <!-- 论文介绍 -->
      <el-table-column label='论文介绍' prop="introduction" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
       <!-- 论文类型 -->
      <el-table-column
            label="论文类型"
            :filters="[{text:'核心', value: '1'},{ text: '普通', value: '2' }]"
            :filter-method="filterPaperType"
            class-name="paperType-col"
            align="center"
            min-width="90px"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.paperType | paperTypeFilter">
                    {{ row.paperType === 1 ? '核心' : '普通' }}
                </el-tag>
            </template>
        </el-table-column>
      <!--创建时间-->
      <el-table-column label='创建时间' prop="time" :show-overflow-tooltip="true" align="center" min-width="150px">
          <template slot-scope="scope">
            <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
       <!-- 论文下载  -->
      <el-table-column label="论文下载" prop="url" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
       <!-- 花费  -->
       <el-table-column label="花费" prop="cost" :show-overflow-tooltip="true" align="center" min-width="80px">
          <template slot-scope="scope">
              <span>{{ scope.row.cost }}</span>
          </template>
      </el-table-column>
      <!-- 状态  -->
      <el-table-column
            label="状态"
            :filters="[{text: '进行中', value: '1'},{ text: '已完成', value: '2' }]"
            :filter-method="filterState"
            class-name="state-col"
            align="center"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.state | stateFilter">
                    {{ row.state === 2 ? '已完成' : '进行中' }}
                </el-tag>
            </template>
      </el-table-column>
       <!-- 发票  -->
      <el-table-column label="发票" prop="invoice" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.invoice }}</span>
        </template>
      </el-table-column>
      <!-- 是否已报销  -->
      <el-table-column
            label="是否已报销"
            :filters="[{text: '否', value: '0'},{ text: '是', value: '1' }]"
            :filter-method="filterReimbursement"
            class-name="reimbursement-col"
            align="center"
      >
            <template slot-scope="{row}">
                <el-tag :type="row.reimbursement | reimbursementFilter">
                    {{ row.reimbursement === 1 ? '是' : '否' }}
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
    <thesis-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <thesis-view
      ref="view"
      :dialog-visible="userViewVisible"
      @close="viewClose"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import ThesisEdit from './Edit'
import ThesisView from './View'
export default {
  name: 'ThesisManage',
  components: { Pagination, ThesisEdit, ThesisView },
  filters: {
    paperTypeFilter(paperType) {
      const map = {
        1: '',
        2: ''
      }
      return map[paperType]
    },
    stateFilter(state) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[state]
    },
    reimbursementFilter(reimbursement) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[reimbursement]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      userViewVisible: false,
      tableKey: 0,
      loading: false,
      list: [],
      total: 0,
      queryParams: { reimbursement: '' },
      selection: [],
      pagination: {
        size: 10,
        num: 1
      },
      thesisId: '',
      title: '',
      whether: [
        {
          id: 0,
          name: '否'
        },
        {
          id: 1,
          name: '是'
        }
      ]
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
    filterPaperType(value, row) {
      return row.paperType === value
    },
    filterState(value, row) {
      return row.state === value
    },
    filterReimbursement(value, row) {
      return row.reimbursement === value
    },
    viewClose() {
      this.userViewVisible = false
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    search() {
      if (this.thesisId !== '') {
        this.getIdInfo(this.thesisId)
        return
      }
      this.fetch({
        ...this.queryParams
      })
    },
    getIdInfo(id) {
      this.$get(`studio/thesis/${id}`).then((r) => {
        const data = r.data.data
        data.thesisId = data.thesis_id
        const arr = []
        arr.push(data)
        this.list = arr
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    exportExcel() {
      this.$download('studio/task/thesis/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `thesis_${new Date().getTime()}.xlsx`)
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
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
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const thesisIds = []
        this.selection.forEach((r) => {
          thesisIds.push(r.thesisId)
        })
        this.delete(thesisIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(thesisIds) {
      this.loading = true
      this.$delete(`studio/thesis/${thesisIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    view(row) {
      this.$refs.view.setThesis(row)
      this.$refs.view.setUser(row)
      this.userViewVisible = true
    },
    edit(row) {
      let roleId = []
      if (row.roleId && typeof row.roleId === 'string') {
        roleId = row.roleId.split(',')
        row.roleId = roleId
      }
      // 这发送请求只是为了拿到部门，也是参数
      this.$get(`studio/thesis`).then((r) => {
        row.thesisIds = r.data.data
        this.$refs.edit.setTasks(row)
        this.dialog.title = this.$t('common.edit')
        this.dialog.isVisible = true
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0]
        params.createTimeTo = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/thesis', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    }
    // sortChange(val) {
    //      this.sort.field = val.prop
    //      this.sort.order = val.order
    //      this.search()
    //  }
  }
}
</script>
<style lang="scss" scoped>
</style>

