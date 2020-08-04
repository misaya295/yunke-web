<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 输入框 -->
      <el-input v-model="queryParams.fullName" placeholder="姓名" class="filter-item search-item"></el-input>
      <el-select v-model="queryParams.state" placeholder="请选择考试状态">
        <el-option
          v-for="(item,i) in stateOptions"
          :key="i"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button @click="searchPostgraduate" type="primary" class="filter-item" plain>搜索</el-button>
      <el-button @click="resetPostgraduate" type="warning" class="filter-item" plain>重置</el-button>
      <el-button type="success" class="filter-item" @click="showAddDialog" plain>添加</el-button>
      <!-- table内容 -->
      <el-table ref="tableref" :data="postgraduateList" border fit style="width: 100%;">
        <el-table-column type="selection" align="center" width="40px" />
        <el-table-column
          label="姓名"
          prop="fullName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        ></el-table-column>
        <el-table-column
          label="报考时间"
          prop="time"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        ></el-table-column>
        <el-table-column
          label="报考学校"
          prop="school"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        ></el-table-column>
        <el-table-column
          label="报考方向"
          prop="orientation"
          :show-overflow-tooltip="true"
          align="center"
          min-width="120px"
        ></el-table-column>
        <el-table-column
          label="统考成绩"
          prop="exam"
          :show-overflow-tooltip="true"
          align="center"
          min-width="80px"
        ></el-table-column>
        <el-table-column
          label="通过状态"
          prop="success"
          :show-overflow-tooltip="true"
          align="center"
          min-width="70px"
        >
          <template slot-scope="scope">
            <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.success === 1"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
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
            <el-tag type="warning" v-if="scope.row.state === 0">正在考取</el-tag>
            <el-tag type="success" v-else>已完成</el-tag>
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
      <el-dialog @close="closeAddDialog" title="添加考研" :visible.sync="addDialogVisible" width="50%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="addForm.fullName" disabled></el-input>
          </el-form-item>
          <el-form-item label="报考时间" prop="type">
            <el-date-picker
              v-model="addForm.time"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="报考学校" prop="school">
            <el-input v-model="addForm.school"></el-input>
          </el-form-item>
          <el-form-item label="报考方向" prop="orientation" type="number">
            <el-input v-model="addForm.orientation"></el-input>
          </el-form-item>
          <el-form-item label="统考成绩" prop="exam">
            <el-input v-model="addForm.exam"></el-input>
          </el-form-item>
          <el-form-item label="通过状态" prop="success">
            <el-radio-group v-model="addForm.success">
              <el-radio :label="0">失败</el-radio>
              <el-radio :label="1">成功</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-select v-model="addForm.state" placeholder="请选择状态" style="width:100%">
              <el-option label="正在考取" :value="0"></el-option>
              <el-option label="已完成" :value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addPostgraduate">添 加</el-button>
        </span>
      </el-dialog>

      <!-- 修改对话框 -->
      <el-dialog
        @close="closeEditDialog"
        title="修改考证信息"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="editForm.fullName" disabled></el-input>
          </el-form-item>
          <el-form-item label="报考时间" prop="type">
            <el-input v-model="editForm.time"></el-input>
          </el-form-item>
          <el-form-item label="报考学校" prop="school">
            <el-input v-model="editForm.school"></el-input>
          </el-form-item>
          <el-form-item label="报考方向" prop="orientation" type="number">
            <el-input v-model.number="editForm.orientation"></el-input>
          </el-form-item>
          <el-form-item label="统考成绩" prop="exam">
            <el-input v-model="editForm.exam"></el-input>
          </el-form-item>
          <el-form-item label="通过状态" prop="success">
            <el-radio-group v-model="editForm.success">
              <el-radio :label="0">失败</el-radio>
              <el-radio :label="1">成功</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-select v-model="editForm.state" placeholder="请选择状态" style="width:100%">
              <el-option label="正在考取" :value="0"></el-option>
              <el-option label="已完成" :value="1"></el-option>
            </el-select>
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
import Pagination from "@/components/Pagination";
export default {
  name: "Index",
  components: { Pagination },
  data() {
    return {
      //输入框的值
      input: "",
      //存放查询数据
      postgraduateList: [],
      //存放查询数目
      total: 0,
      queryParams: {},
      stateOptions: [
        {
          value: "0",
          label: "正在考取",
        },
        {
          value: "1",
          label: "已完成",
        },
      ],
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1,
      },
      //添加对话框的显示与隐藏
      addDialogVisible: false,
      userInfo: {},
      //绑定添加对话框中的表单数据
      addForm: {
        fullName: "",
        userId: 0,
        time: "",
        school: "",
        orientation: "",
        exam: "",
        success: 0,
        state: undefined,
      },
      //添加对话框的验证规则
      addFormRules: {
        success: [
          { required: true, message: "请填写通过状态！", trigger: "blur" },
        ],
        state: [{ required: true, message: "请填写状态！", trigger: "blur" }],
      },
      //修改对话框的显示与隐藏
      editDialogVisible: false,
      //绑定修改对话框中的表单数据
      editForm: {
        fullName: "",
        id: 0,
        userId: "",
        time: "",
        school: "",
        title: "",
        orientation: "",
        exam: "",
        success: "",
        state: undefined,
      },
      //修改对话框的验证规则
      editFormRules: {
        success: [
          { required: true, message: "请填写通过状态！", trigger: "blur" },
        ],
        state: [{ required: true, message: "请填写状态！", trigger: "blur" }],
      },
    };
  },
  created() {
    //获取用户信息
    this.userInfo = this.currentUser;
  },
  mounted() {
    this.fetch();
  },
  computed: {
    currentUser() {
      const user = this.$store.state.account.user;
      this.userInfo = user;
      return user;
    },
  },
  methods: {
    //根据条件获取所有考证信息
    fetch(params = {}) {
      params.pageSize = this.pagination.size;
      params.pageNum = this.pagination.num;
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0];
        params.createTimeTo = this.queryParams.timeRange[1];
      }
      this.loading = true;
      this.$get("studio/postgraduate", {
        ...params,
      }).then((r) => {
        console.log(r);
        const data = r.data.data;
        this.total = data.total;
        this.postgraduateList = data.rows;
        console.log(data);
        this.loading = false;
      });
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort,
      });
    },

    //展示对话框
    //完成时记得打开检查id的判断
    showAddDialog() {
      //判断是否为学生
      // if (this.userInfo.roleId !== 7) {
      //   return this.$message.info("您不是学生，无法添加考证！");
      // }
      //获得id
      this.addForm.fullName = this.userInfo.fullName;
      this.addForm.userId = this.userInfo.userId;
      this.addDialogVisible = true;
    },
    //提交添加考证表单
    addPostgraduate() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return;
        //判断通过状态和考试状态是否冲突
        if (this.addForm.state == 0 && this.addForm.success == 1) {
          return this.$message.error("考试还未结束，无法将通过状态设置为成功!");
        }
        //把考证ID转为数字
        this.addForm.id = this.addForm.id - 0;
        this.$post("studio/postgraduate", {
          ...this.addForm,
        }).then((r) => {
          if (r.status == 200) {
            this.$message.success("添加考证成功!");
          } else {
            this.$message.error("添加考证失败！");
          }
        });
        this.addDialogVisible = false;
        this.fetch();
        console.log(this.addForm.id);
      });
    },
    //监听关闭对话框事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields();
    },
    // 搜索考证
    searchPostgraduate() {
      console.log(this.queryParams);
      this.$get(`studio/postgraduate`, { ...this.queryParams }).then((r) => {
        const data = r.data.data;
        this.postgraduateList = data.rows;
        this.total = data.total;
        console.log(r);
      });
    },
    //重置搜索框数据
    resetPostgraduate() {
      this.queryParams = {};
      this.fetch();
    },
    //获取时间
    getTime: function () {
      var _this = this;
      let yy = new Date().getFullYear();
      let mm =
        new Date().getMonth() + 1 < 10
          ? "0" + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1;
      let dd =
        new Date().getDate() < 10
          ? "0" + new Date().getDate()
          : new Date().getDate();
      let HH =
        new Date().getHours() < 10
          ? "0" + new Date().getHours()
          : new Date().getHours();
      let MM =
        new Date().getMinutes() < 10
          ? "0" + new Date().getMinutes()
          : new Date().getMinutes();
      let SS =
        new Date().getSeconds() < 10
          ? "0" + new Date().getSeconds()
          : new Date().getSeconds();
      _this.nowTime = HH + ":" + MM + ":" + SS;
      _this.nowDate = yy + "-" + mm + "-" + dd;
      return _this.nowDate + " " + _this.nowTime;
    },
    //修改考证对话框
    showEditDialog(row) {
      if (this.userInfo.userId != row.userId) {
        return this.$message.info("仅允许本人操作！");
      }
      //获得数据
      //浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.editForm = Object.assign({}, row);
      this.editDialogVisible = true;
    },
    //提交修改对话框
    editPostgraduate() {
      this.$refs.editFormRef.validate((valid) => {
        if (!valid) return;
        //判断通过状态和考试状态是否冲突
        if (this.editForm.state == 0 && this.editForm.success == 1) {
          return this.$message.error("考试还未结束，无法将通过状态设置为成功!");
          //把考证ID转为字符串
          this.editForm.id = this.editForm.id - 0;
        }
        this.$put("studio/postgraduate", { ...this.editForm }).then((r) => {
          if (r.status === 200) {
            this.$message.success("修改考证成功！");
            this.editDialogVisible = false;
            this.fetch();
          } else {
            this.$message.error("修改考证失败！");
          }
        });
      });
    },
    //监听关闭对话框事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
  },
};
</script>

<style scoped>
</style>
