<template>
 <div class="app-container">
    <div class="filter-container">
        <!-- 任务id -->
        <!-- <el-input v-model="matchId"  placeholder="任务id" class="filter-item search-item" /> -->
        <!-- 标题 -->
        <el-input v-model="queryParams.title" placeholder="标题"  class="filter-item search-item"/>
        <!-- 真实姓名 -->
        <el-input v-model="queryParams.fullName" placeholder="真实姓名"  class="filter-item search-item"/>
        <!-- 是否已报销 -->
        <el-select  v-model="queryParams.reimbursement"  value="" placeholder="是否已报销">
          <el-option
            v-for="match in whether"
            :key="match.id"
            :label="match.name"
            :value="match.id"
          />
        </el-select>
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

    <!-- 表 -->
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
        <!-- 比赛id -->
        <el-table-column label="比赛id" prop="matchId" :show-overflow-tooltip="true" align="center" min-width="130px">
            <template slot-scope="scope">
                <span>{{ scope.row.matchId }}</span>
            </template>
        </el-table-column>
        <!-- 任务标题 -->
        <el-table-column label="标题" prop="title" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.title }}</span>
            </template>
        </el-table-column>
        <!-- 比赛等级 -->
        <el-table-column 
            label="比赛等级" 
            :filters="[{text: '国家级', value: '0'},{ text: '省级', value: '1' },{ text: '校级', value: '2' }]"
            :filter-method="filterLevel"
            class-name="level-col"
            align="center"
            min-width="90px"
        >
             <template slot-scope="{row}">
                <el-tag :type="row.level | levelFilter">
                    <span>{{transLevel(row.level)}}</span> 
                </el-tag>
            </template>

        </el-table-column>
        <!-- 比赛类型 -->
        <el-table-column
            label="比赛类型"
            :filters="[{text: '个人', value: '0'},{ text: '团队', value: '1' }]"
            :filter-method="filterType"
            class-name="type-col"
            align="center"
            min-width="90px"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.type | typeFilter">
                    {{ row.type === 1 ? '团队' : '个人' }}
                </el-tag>
            </template>
        </el-table-column>
        <!-- 申请书 -->
        <el-table-column label="申请书" prop="application_form" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.application_form }}</span>
            </template>
        </el-table-column>
        <!-- 比赛时间 -->
        <el-table-column label="比赛时间" prop="time" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.time }}</span>
            </template>
        </el-table-column>
        <!-- 花费 -->
        <el-table-column label="花费" prop="cost" :show-overflow-tooltip="true" align="center" min-width="50px">
            <template slot-scope="scope">
                <span>{{ scope.row.cost }}</span>
            </template>
        </el-table-column>
        <!-- 发票 -->
        <el-table-column label="发票" prop="invoice" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.invoice }}</span>
            </template>
        </el-table-column>
        <!-- 证书 -->
        <el-table-column label="证书" prop="certificate" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.certificate }}</span>
            </template>
        </el-table-column>
        <!-- 状态 -->
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
        <!-- 是否已报销 -->
        <el-table-column
          label="报销"
          :filters="[{text: '未报销', value: '0'},{ text: '已报销', value: '1' }]"
          :filter-method="filterReimbursement"
          class-name="reimbursement-col"
          align="center"
        >
          <template slot-scope="{row}">
            <el-tag :type="row.reimbursement | reimbursementFilter">
              {{ row.reimbursement === 1 ? '已报销' : '未报销' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 操作-->
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
    <match-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <match-view
      ref="view"
      :dialog-visible="userViewVisible"
      @close="viewClose"
    />
 </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import MatchEdit from './Edit'
import MatchView from './View'
export default {
  name: 'MatchManage',
  components: { Pagination, MatchEdit, MatchView },
  filters: {
    // 比赛等级
    levelFilter(level) {
      const map = {
        0: '',
        1: '',
        2: ''
      }
      return map[level]
    },
    // 比赛类型
    typeFilter(type) {
      const map = {
        0: '',
        1: ''
      }
      return map[type]
    },
    // 状态
    stateFilter(state) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[state]
    },
    // 是否已报销
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
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      },
      matchId: '',
      title: '',
      whether: [
        {
          id: 0,
          name: '未报销'
        },
        {
          id: 1,
          name: '已报销'
        }
      ]
    }
  },
  created() {
    this.fetch()
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
    // 比赛等级
    transLevel(level) {
      switch (level) {
        case 0:
          return '国家级'
        case 1:
          return '省级'
        default:
          return '校级'
      }
    },
    filterLevel(value, row) {
      return row.level === value
    },
    // 比赛类型
    filterType(value, row) {
      return row.type === value
    },
    // 状态
    filterState(value, row) {
      return row.state === value
    },
    // 是否已报销
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
      if (this.matchId !== '') {
        this.getIdInfo(this.matchId)
        return
      }
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    getIdInfo(id) {
      this.$get(`studio/match/${id}`).then((r) => {
        const data = r.data.data
        data.matchId = data.match_id
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
      this.$download('studio/task/match/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `match_${new Date().getTime()}.xlsx`)
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    // 操作--->删除
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    // 更多操作--->删除
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
        const matchIds = []
        this.selection.forEach((r) => {
          matchIds.push(r.matchId)
        })
        this.delete(matchIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(matchIds) {
      this.loading = true
      this.$delete(`studio/match/${matchIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    view(row) {
      this.$refs.view.setMatch(row)
      this.$refs.view.setUser(row)
      this.userViewVisible = true
    },
    edit(row) {
      let roleId = []
      if (row.roleId && typeof row.roleId === 'string') {
        roleId = row.roleId.split(',')
        row.roleId = roleId
      }
      this.$get(`studio/match`).then((r) => {
        // row.deptIds = r.data.data
        row.matchIds = r.data.data
        // this.$refs.edit.setUser(row)
        this.$refs.edit.setTasks(row)
        this.dialog.title = this.$t('common.edit')
        this.dialog.isVisible = true
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('studio/match', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    sortChange(val) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
