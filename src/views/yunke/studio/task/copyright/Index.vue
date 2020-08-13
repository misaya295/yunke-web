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
      @expand-change="getTeam"
    >
      <!-- 展开区域 -->
      <el-table-column type="expand" width="30px">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-row>
              <el-col :span="8">
              <el-form-item label="负责人:">
                <span>{{ team.reliable}}</span>
              </el-form-item>
              </el-col>
              <el-col :span="8">
              <el-form-item label="指导老师:">
                <span>{{ team.teacher }}</span>
              </el-form-item>
               </el-col>
              <el-col :span="8">
              <el-form-item label="成员:">
                <span>{{ team.member }}</span>
              </el-form-item>
              </el-col>
              </el-row>
            </el-form>
            <el-form label-position="left" class="table-expand">
              <el-row>
              <el-col :span="8">
              <el-form-item label="花费:">
                <span>{{ props.row.cost }}</span>
              </el-form-item>
              </el-col>
              <el-col :span="8">
              <el-form-item label="结束时间:">
                <span>{{ props.row.endTime }}</span>
              </el-form-item>
              </el-col>
              <el-col :span="8">
              <el-form-item label="软件协议:">
                <span>{{ props.row.agreement }}</span>
              </el-form-item>
              </el-col>
              </el-row>
            </el-form>
            <el-form label-position="left" class="table-expand">
              <el-row>
              <el-col :span="8">
              <el-form-item label="申请书:">
                <span>{{ props.row.applicationForm }}</span>
              </el-form-item>
              </el-col>
              <el-col :span="8">
              <el-form-item label="源文件:">
                <span>{{ props.row.originFile }}</span>
              </el-form-item>
              </el-col>
              </el-row>
            </el-form>
            <el-form label-position="left" class="table-expand">
             <el-row>
              <el-col :span="8">
               <el-form-item label="发票:">
                <div class="demo-image" v-if="props.row.invoice">
                  <div class="block" v-for="(item, i) in props.row.invoice.split(',')" :key="i">
                    <el-image
                      :src="item"
                      @click="showpreViewDialog(item)">
                      </el-image>
                  </div>
                </div>
              </el-form-item>
              </el-col>
              <el-col :span="8">
              <el-form-item label="证书:">
                <div class="demo-image" v-if="props.row.certificate">
                  <div class="block" v-for="(item, i) in props.row.certificate.split(',')" :key="i">
                    <el-image
                      :src="item"
                      @click="showpreViewDialog(item)">
                      </el-image>
                  </div>
                </div>
              </el-form-item>
              </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
      <el-table-column type="selection" align="center" width="45px" />
      <!-- 项目名称 -->
      <el-table-column  label="项目名称" prop="itemsId" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.itemTitle }}</span>
        </template>
      </el-table-column>
      <!-- 著作权名称 -->
      <el-table-column  label="著作权名称" prop="title"  :show-overflow-tooltip="true" align="center" min-width="120px">
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
      <el-table-column label="开始时间" prop="startTime" align="center" min-width="150px" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <!-- 著作权状态  -->
       <el-table-column
        label="状态"
        :filters="[{ text: '进行中', value: 1 }, { text: '已完成', value: 2 }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.state === 1 ? '进行中' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
         <!-- 项目是否已报销  -->
       <el-table-column
        min-width="110px"
        label="是否已报销"
        :filters="[{ text: '未报销', value: 0 }, { text: '已报销', value: 1 }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.reimbursement | whetherFilter">
            {{ row.reimbursement === 1 ? '已报销' : '未报销' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-hasPermission="['task:add']" class="el-icon-coin table-operation" style="color: #87d068;" @click="changeReimbursement(row)" />
          <i v-hasPermission="['task:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i v-hasPermission="['task:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <i v-hasPermission="['task:view']" class="el-icon-info table-operation" style="color: #909399;" @click="toogleExpand(row)" />
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
     <!-- <tasks-view
      ref="view"
      :dialog-visible="taskViewVisible"
      @close="viewClose"
    /> -->
    <!-- 图片预览 -->
    <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="30%"
        @close="previewDialogClose"
      >
        <el-image :src="previewPath" alt class="previewImg" />
      </el-dialog>
  </div>
</template>

<script>
import TasksEdit from './Edit'
// import TasksView from './View'
import Pagination from '@/components/Pagination'

export default {
  name: 'TaskItems',
  components: { Pagination, TasksEdit },
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
      // taskViewVisible: false,
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
      newWin: null,
      // 申请报销所需的资金对象
      Funding: {
        name: '',
        applyTime: '',
        proposerId: 0
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      // 保存负责人，成员，指导老师
      team: {
        reliable: '',
        member: '',
        teacher: ''
      }
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
    // viewClose() {
    //   this.taskViewVisible = false
    // },
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
    getTeam(row) {
      this.view(row)
    },
    view(row) {
      this.$get(`studio/copyright/${row.copyrightId}`).then((r) => {
        console.log(11, r)
        const uResult = []
        const data = r.data.data
        let userId = []
        let userState = []
        if (data.userId && typeof data.userId === 'string') {
          userId = data.userId.split(',')
        }
        if (data.userState && typeof data.userState === 'string') {
          userState = data.userState.split(',')
        }
        // 拿到uesrId及名称
        this.$get('system/user').then((r) => {
          const rows = r.data.data.rows
          rows.forEach((v, i) => {
            userId.forEach((v1, i1) => {
              if (v1 === ('' + v.userId)) {
                uResult.push(v.fullName)
              }
            })
          })
          let reliable = ''
          let member = ''
          let teacher = ''
          userState.forEach((v1, i1) => {
            if (v1 === '1') {
              if (reliable === '') {
                reliable = uResult[i1]
              } else {
                reliable += ',' + uResult[i1]
              }
            }
            if (v1 === '2') {
              if (member === '') {
                member = uResult[i1]
              } else {
                member += ',' + uResult[i1]
              }
            }
            if (v1 === '3') {
              if (teacher === '') {
                teacher = uResult[i1]
              } else {
                teacher += ',' + uResult[i1]
              }
            }
          })
          this.team = {
            reliable,
            member,
            teacher
          }
        })
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    edit(row) {
      // 已完成的任务无法修改
      if (parseInt(row.state) === 2) {
        return this.$message.warning('任务已完成无法修改！')
      }
      this.$get(`studio/copyright/${row.copyrightId}`).then((r) => {
        console.log('r', r)
        const data = r.data.data
        let userId = []
        let userState = []
        if (data.userId && typeof data.userId === 'string') {
          userId = data.userId.split(',')
        }
        if (data.userState && typeof data.userState === 'string') {
          userState = data.userState.split(',')
        }
        let reliable = ''
        let member = ''
        let teacher = ''
        userState.forEach((v1, i1) => {
          if (v1 === '1') {
            if (reliable === '') {
              reliable = userId[i1]
            } else {
              reliable += ',' + userId[i1]
            }
          }
          if (v1 === '2') {
            if (member === '') {
              member = userId[i1]
            } else {
              member += ',' + userId[i1]
            }
          }
          if (v1 === '3') {
            if (teacher === '') {
              teacher = userId[i1]
            } else {
              teacher += ',' + userId[i1]
            }
          }
        })
        row.reliable = reliable
        row.member = member === '' ? [] : member.split(',')
        row.teacher = teacher === '' ? [] : teacher.split(',')
        console.log(row)
        this.$refs.edit.setCopyRight(row)
        this.dialog.title = this.$t('common.edit')
        this.dialog.isVisible = true
      })
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
        this.listRows.forEach((v, i) => {
          if (v.invoice === null) {
            v.invoice = ''
          }
        })
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
    },
    // 弹出申请报销对话框
    changeReimbursement(row) {
      this.$get(`studio/copyright/${row.copyrightId}`).then(async(r) => {
        const data = r.data.data
        const userId = data.userId || ''
        // 管理员权限  任务负责人权限
        let flag = this.currentUser.roleId.indexOf('1') === -1
        const fg = userId.indexOf(this.currentUser.userId) !== 0
        if (!flag || !fg) {
          flag = false
        }
        if (flag) {
          return this.$message.info('仅允许管理员或任务负责人操作！')
        }
        // 检查项目是否完成
        if (row.state === 1) {
          return this.$message.info('请完成项目任务后再申请报销!')
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
        this.Funding.proposerId = this.currentUser.userId
        this.Funding.name = row.title + '项目任务报销'
        console.log(this.Funding)
        this.$router.push({
          name: '经费管理',
          params: {
            Funding: this.Funding
          }
        })
      })
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
    // 手风琴效果
    async toogleExpand(row) {
      await this.view(row)
      const $table = this.$refs.table
      this.listRows.map((item) => {
        if (row.itemsId !== item.itemsId) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
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
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = ''
      this.previewVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
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
.demo-image {
  display: flex;
}
.demo-image .el-image {
  width: 50px;
  height: 50px;
  margin: 0px 10px;
  border:  1px solid #000;
}
</style>
