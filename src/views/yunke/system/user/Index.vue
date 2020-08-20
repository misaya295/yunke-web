<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.fullName"
        :placeholder="$t('table.user.realName')"
        class="filter-item search-item"
      />
      <treeselect
        v-model="queryParams.deptId"
        :multiple="false"
        :options="depts"
        :clear-value-text="$t('common.clear')"
        placeholder="部门"
        class="filter-item search-item"
      />
      <el-date-picker
        v-model="queryParams.grade"
        :placeholder="$t('table.user.grade')"
        value-format="yyyy"
        class="filter-item search-item date-range-item"
        type="year"
        style="width: 150px"
      />
      <el-select
        v-model="queryParams.profession"
        placeholder="请选择"
        class="filter-item search-item"
        style="width:180px"
      >
        <el-option
          v-for="item in professionList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button class="filter-item" type="primary" plain @click="search">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" type="warning" plain @click="reset">{{ $t('table.reset') }}</el-button>
      <el-button
        v-has-permission="['user:add']"
        class="filter-item"
        type="success"
        plain
        @click="add"
      >{{ $t('table.add') }}</el-button>
      <el-dropdown
        v-has-any-permission="['user:add','user:delete','user:reset','user:export']"
        trigger="click"
        class="filter-item"
      >
        <el-button>
          {{ $t('table.more') }}
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-has-permission="['user:delete']"
            @click.native="batchDelete"
          >{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item
            v-has-permission="['user:reset']"
            @click.native="resetPassword"
          >{{ $t('table.resetPassword') }}</el-dropdown-item>
          <el-dropdown-item
            v-has-permission="['user:export']"
            @click.native="exportExcel"
          >{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-table
      ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
      :row-key="getRowKey"
      @selection-change="onSelectChange"
      @sort-change="sortChange"
      @row-click="toogleExpand"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column
        :label="$t('table.user.username')"
        prop="username"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.user.realName')"
        prop="fullName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.fullName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.user.email')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="150px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.user.mobile')"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.user.dept')" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.user.noteName')"
        prop="noteName"
        align="center"
        min-width="150px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.noteName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.user.sex')"
        :filters="[{ text: $t('common.sex.male'), value: '0' }, { text: $t('common.sex.female'), value: '1' }, { text: $t('common.sex.secret'), value: '2' }]"
        :filter-method="filterSex"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.sex | sexFilter">{{ transSex(row.sex) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.user.status')"
        :filters="[{ text: $t('common.status.valid'), value: '1' }, { text: $t('common.status.invalid'), value: '0' }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag
            :type="row.status | statusFilter"
          >{{ row.status === '1' ? $t('common.status.valid') : $t('common.status.invalid') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.operation')"
        align="center"
        min-width="100px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <i
            v-hasPermission="['user:view']"
            class="el-icon-info table-operation"
            style="color: #909399;"
            @click.stop="toogleExpand(row)"
          />
          <i
            v-hasPermission="['user:update']"
            class="el-icon-setting table-operation"
            style="color: #2db7f5;"
            @click.stop="edit(row)"
          />
          <i
            v-hasPermission="['user:delete']"
            class="el-icon-delete table-operation"
            style="color: #f50;"
            @click.stop="singleDelete(row)"
          />
          <el-link
            v-has-no-permission="['user:view','user:update','user:delete']"
            class="no-perm"
          >{{ $t('tips.noPermission') }}</el-link>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="1px">
        <template slot-scope="{row}">
          <el-form
            :title="$t('common.view')"
            :width="width"
            class="user-view"
            inline
          >
            <el-row>
              <el-col :span="8">
                <el-form-item class="view-item">
                  <i class="el-icon-trophy" />
                  <span>{{ $t('table.user.role') +'：' }}</span>
                  {{ row.roleName }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="view-item">
                  <i class="el-icon-bangzhu" />
                  <span>{{ $t('table.user.status') +'：' }}</span>
                  {{ row.status === '1' ? $t('common.status.valid') : $t('common.status.invalid') }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="view-item">
                  <i class="el-icon-bell" />
                  <span>{{ $t('table.user.createTime') +'：' }}</span>
                  {{ row.createTime }}
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-form-item class="view-item">
                  <i class="el-icon-bell" />
                  <span>{{ $t('table.user.updateTime') +'：' }}</span>
                  {{ row.updateTime }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="view-item">
                  <i class="el-icon-circle-check" />
                  <span>{{ $t('table.user.lastLoginTime') +'：' }}</span>
                  {{ row.lastLoginTime }}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item class="view-item">
                  <i class="el-icon-document" />
                  <span>{{ $t('table.user.desc') +'：' }}</span>
                  {{ row.description ? user.description: $t('tips.nothing') }}
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pagination.num"
      :limit.sync="pagination.size"
      @pagination="search"
    />
    <user-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <!-- <user-view ref="view" :dialog-visible="userViewVisible" @close="viewClose" /> -->
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import UserEdit from './Edit'

export default {
  name: 'UserManage',
  components: { Pagination, UserEdit, Treeselect },
  filters: {
    sexFilter(status) {
      const map = {
        0: '',
        1: 'success',
        2: 'info'
      }
      return map[status]
    },
    statusFilter(status) {
      const map = {
        0: 'danger',
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
      userViewVisible: false,
      tableKey: 0,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        grade: '',
        profession: '___'
      },
      sort: {},
      selection: [],
      depts: [],
      pagination: {
        size: 10,
        num: 1
      },
      // 专业列表
      professionList: [
        {
          value: '___',
          label: '所有专业'
        },
        {
          value: '044',
          label: '计算机科学与技术'
        },
        {
          value: '064',
          label: '网络工程'
        },
        {
          value: '074',
          label: '软件工程'
        },
        {
          value: '084',
          label: '数媒技术'
        },
        {
          value: '094',
          label: '大数据'
        }
      ],
      screenWidth: 0,
      width: this.initWidth(),
      user: {}
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    avatar() {
      if (this.user.avatar) {
        return require(`@/assets/avatar/${this.user.avatar}`)
      } else {
        return require('@/assets/avatar/default.jpg')
      }
    }
  },
  mounted() {
    this.initDept()
    this.fetch()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    filterStatus(value, row) {
      return row.status === value
    },
    filterSex(value, row) {
      return row.sex === value
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
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    reset() {
      this.queryParams = {
        grade: '',
        profession: '___'
      }
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    exportExcel() {
      this.$download(
        'system/user/excel',
        {
          pageSize: this.pagination.size,
          pageNum: this.pagination.num,
          ...this.queryParams
        },
        `user_${new Date().getTime()}.xlsx`
      )
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    resetPassword() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      this.$confirm(
        this.$t('tips.confirmRestPassword'),
        this.$t('common.tips'),
        {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          const userNames = []
          this.selection.forEach((u) => {
            userNames.push(u.username)
          })
          this.$put('system/user/password/reset', {
            usernames: userNames.join(',')
          }).then(() => {
            this.$message({
              message: this.$t('tips.resetPasswordSuccess'),
              type: 'success'
            })
            this.clearSelections()
          })
        })
        .catch(() => {
          this.clearSelections()
        })
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
      })
        .then(() => {
          const userIds = []
          this.selection.forEach((u) => {
            if (u.userId === this.currentUser.userId) {
              contain = true
              return
            }
            userIds.push(u.userId)
          })
          if (contain) {
            this.$message({
              message: this.$t('tips.containCurrentUser'),
              type: 'warning'
            })
            this.clearSelections()
          } else {
            this.delete(userIds)
          }
        })
        .catch(() => {
          this.clearSelections()
        })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(userIds) {
      this.loading = true
      this.$delete(`system/user/${userIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    view(row) {
      this.$refs.view.setUser(row)
      this.userViewVisible = true
    },
    edit(row) {
      let roleId = []
      if (row.roleId && typeof row.roleId === 'string') {
        roleId = row.roleId.split(',')
        row.roleId = roleId
      }
      this.$get(`system/user/${row.userId}`).then((r) => {
        row.deptIds = r.data.data
        this.$refs.edit.setUser(row)
        this.dialog.title = this.$t('common.edit')
        this.dialog.isVisible = true
      })
    },
    fetch(params = {}) {
      console.log(params)
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0]
        params.createTimeTo = this.queryParams.timeRange[1]
      }
      if (
        this.queryParams.grade === '' ||
        this.queryParams.grade === null ||
        this.queryParams.grade === '____'
      ) {
        params.grade = '____'
      }
      if (
        this.queryParams.profession === '' ||
        this.queryParams.profession === null ||
        this.queryParams.profession === '___'
      ) {
        params.profession = '___'
      }
      console.log(typeof this.queryParams.deptId)
      if (typeof this.queryParams.deptId === 'string') {
        params.deptId = this.queryParams.deptId - 0
      }
      if (typeof this.queryParams.deptId === 'undefined') {
        params.deptId = '%'
      }
      this.loading = true
      this.$get('system/user', {
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
    },
    initDept() {
      this.$get('system/dept')
        .then((r) => {
          this.depts = r.data.data.rows
          this.deptTree = this.depts
        })
        .catch((error) => {
          console.error(error)
          this.$message({
            message: this.$t('tips.getDataFail'),
            type: 'error'
          })
        })
    },
    // 手风琴效果
    toogleExpand(row, event, column) {
      const $table = this.$refs.table
      this.list.map((item) => {
        if (row.userId !== item.userId) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    getRowKey(row) {
      return row.userId
    },
    transSex(sex) {
      switch (sex) {
        case '0':
          return this.$t('common.sex.male')
        case '1':
          return this.$t('common.sex.female')
        default:
          return this.$t('common.sex.secret')
      }
    },
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 550) {
        return '95%'
      } else if (this.screenWidth < 990) {
        return '580px'
      } else if (this.screenWidth < 1400) {
        return '600px'
      } else {
        return '650px'
      }
    },
    setUser(val) {
      this.user = { ...val }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.user-view {
  .img-wrapper {
    text-align: center;
    margin-top: -1.5rem;
    margin-bottom: 10px;
    img {
      width: 4rem;
      border-radius: 50%;
    }
  }
  .view-item {
    margin: 7px;
    i {
      font-size: 0.97rem;
    }
    span {
      margin-left: 5px;
    }
  }
}
</style>
